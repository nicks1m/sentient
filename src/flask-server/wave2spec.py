#@title Waveform to Spectrogram conversion

''' Decorsière, Rémi, Peter L. Søndergaard, Ewen N. MacDonald, and Torsten Dau.
"Inversion of auditory spectrograms, traditional spectrograms, and other envelope representations."
IEEE/ACM Transactions on Audio, Speech, and Language Processing 23, no. 1 (2014): 46-56.'''

#ORIGINAL CODE FROM https://github.com/yoyololicon/spectrogram-inversion

from glob import glob
import torchaudio
import tensorflow as tf
import torch
import torch.nn as nn
import numpy as np
import torch.nn.functional as F
from numpy import linspace
from numpy import asarray
from tqdm import tqdm
from functools import partial
import math
import heapq
from torchaudio.transforms import MelScale, Spectrogram
import librosa
import PIL
#import matplotlib as plt
import soundfile as sf
from autoencoder import VAE

#torch.set_default_tensor_type('torch.cuda.FloatTensor')

hop=256               #hop size (window size = 4*hop)
sr=44100              #sampling rate
min_level_db=-100     #reference values to normalize data
ref_level_db=20

shape=128           #length of time axis of split specrograms
spec_split=1

specobj = Spectrogram(n_fft=4*hop, win_length=4*hop, hop_length=hop, pad=0, power=2, normalized=False)
specfunc = specobj.forward
melobj = MelScale(n_mels=hop, sample_rate=sr, f_min=0.)
melfunc = melobj.forward

def melspecfunc(waveform):
  specgram = specfunc(waveform)
  mel_specgram = melfunc(specgram)
  return mel_specgram

def spectral_convergence(input, target):
    return 20 * ((input - target).norm().log10() - target.norm().log10())

def GRAD(spec, transform_fn, samples=None, init_x0=None, maxiter=1000, tol=1e-6, verbose=1, evaiter=10, lr=0.002):

    spec = torch.Tensor(spec)
    samples = (spec.shape[-1]*hop)-hop

    if init_x0 is None:
        init_x0 = spec.new_empty((1,samples)).normal_(std=1e-6)
    x = nn.Parameter(init_x0)
    T = spec

    criterion = nn.L1Loss()
    optimizer = torch.optim.Adam([x], lr=lr)

    bar_dict = {}
    metric_func = spectral_convergence
    bar_dict['spectral_convergence'] = 0
    metric = 'spectral_convergence'

    init_loss = None
    with tqdm(total=maxiter, disable=not verbose) as pbar:
        for i in range(maxiter):
            optimizer.zero_grad()
            V = transform_fn(x)
            loss = criterion(V, T)
            loss.backward()
            optimizer.step()
            lr = lr*0.9999
            for param_group in optimizer.param_groups:
              param_group['lr'] = lr

            if i % evaiter == evaiter - 1:
                with torch.no_grad():
                    V = transform_fn(x)
                    bar_dict[metric] = metric_func(V, spec).item()
                    l2_loss = criterion(V, spec).item()
                    pbar.set_postfix(**bar_dict, loss=l2_loss)
                    pbar.update(evaiter)

    return x.detach().view(-1).cpu()

def normalize(S):
  return np.clip((((S - min_level_db) / -min_level_db)*2.)-1., -1, 1)

def denormalize(S):
  return (((np.clip(S, -1, 1)+1.)/2.) * -min_level_db) + min_level_db

def prep(wv,hop=192):
  S = np.array(torch.squeeze(melspecfunc(torch.Tensor(wv).view(1,-1))).detach().cpu())
  S = librosa.power_to_db(S)-ref_level_db
  return normalize(S)

def deprep(S):
  S = denormalize(S)+ref_level_db
  S = librosa.db_to_power(S)
  wv = GRAD(np.expand_dims(S,0), melspecfunc, maxiter=2500, evaiter=10, tol=1e-8)
  return np.array(np.squeeze(wv))

#@title Helper functions

#Generate spectrograms from waveform array
def tospec(data):
  specs=np.empty(data.shape[0], dtype=object)
  for i in range(data.shape[0]):
    x = data[i]
    S=prep(x)
    S = np.array(S, dtype=np.float32)
    specs[i]=np.expand_dims(S, -1)
  print(specs.shape)
  return specs

#Generate multiple spectrograms with a determined length from single wav file
def tospeclong(path, length=4*44100):
  x, sr = librosa.load(path,sr=44100)
  x,_ = librosa.effects.trim(x)
  loudls = librosa.effects.split(x, top_db=50)
  xls = np.array([])
  for interv in loudls:
    xls = np.concatenate((xls,x[interv[0]:interv[1]]))
  x = xls
  num = x.shape[0]//length
  specs=np.empty(num, dtype=object)
  for i in range(num-1):
    a = x[i*length:(i+1)*length]
    S = prep(a)
    S = np.array(S, dtype=np.float32)
    try:
      sh = S.shape
      specs[i]=S
    except AttributeError:
      print('spectrogram failed')
  print(specs.shape)
  return specs

#Waveform array from path of folder containing wav files
def audio_array(path):
  ls = glob(f'{path}/*.wav')
  adata = []
  for i in range(len(ls)):
    x, sr = tf.audio.decode_wav(tf.io.read_file(ls[i]), 1)
    x = np.array(x, dtype=np.float32)

    adata.append(x)
  return np.array(adata)

#Waveform array from path of folder containing wav files
def single_audio_array(path):
  ls = glob(path)
  adata = []
  for i in range(len(ls)):
    x, sr = tf.audio.decode_wav(tf.io.read_file(ls[i]), 1)
    #x = np.array(x, dtype=np.float32)
    x = np.array(x)
    x = x.astype('float32')
    adata.append(x)
  return np.array(adata)


#Concatenate spectrograms in array along the time axis
def testass(a):
  but=False
  con = np.array([])
  nim = a.shape[0]
  for i in range(nim):
    im = a[i]
    im = np.squeeze(im)
    if not but:
      con=im
      but=True
    else:
      con = np.concatenate((con,im), axis=1)
  return np.squeeze(con)

#Split spectrograms in chunks with equal size
def splitcut(data):
  ls = []
  mini = 0
  minifinal = spec_split*shape   #max spectrogram length
  for i in range(data.shape[0]-1):
    if data[i].shape[1]<=data[i+1].shape[1]:
      mini = data[i].shape[1]
    else:
      mini = data[i+1].shape[1]
    if mini>=3*shape and mini<minifinal:
      minifinal = mini
  for i in range(data.shape[0]):
    x = data[i]
    if x.shape[1]>=3*shape:
      for n in range(x.shape[1]//minifinal):
        ls.append(x[:,n*minifinal:n*minifinal+minifinal,:])
      ls.append(x[:,-minifinal:,:])
  return np.array(ls)

# Generates timestamp string of "day_month_year_hourMin"
#def get_time_stamp():
#  secondsSinceEpoch = time.time()
#  timeObj = time.localtime(secondsSinceEpoch)
#  x = ('%d_%d_%d_%d%d' % (timeObj.tm_mday, timeObj.tm_mon, timeObj.tm_year, timeObj.tm_hour, timeObj.tm_min))
 # return x

#@title Import synthesis utility functions

#-----TESTING FUNCTIONS ----------- #

def select_spec(spec, labels, num_spec=10):
    sample_spec_index = np.random.choice(range(len(spec)), num_spec)
    sample_spec = spec[sample_spec_index]
    sample_labels = labels[sample_spec_index]
    return sample_spec, sample_labels


# def plot_reconstructed_spec(spec, reconstructed_spec):
#     fig = plt.figure(figsize=(15, 3))
#     num_spec = len(spec)
#     for i, (image, reconstructed_image) in enumerate(zip(spec, reconstructed_spec)):
#         image = image.squeeze()
#         ax = fig.add_subplot(2, num_spec, i + 1)
#         ax.axis("off")
#         ax.imshow(image, cmap="gray_r")
#         reconstructed_image = reconstructed_image.squeeze()
#         ax = fig.add_subplot(2, num_spec, i + num_spec + 1)
#         ax.axis("off")
#         ax.imshow(reconstructed_image, cmap="gray_r")
#     plt.show()


# def plot_spec_encoded_in_latent_space(latent_representations, sample_labels):
#     plt.figure(figsize=(10, 10))
#     plt.scatter(latent_representations[:, 0],
#                 latent_representations[:, 1],
#                 cmap="rainbow",
#                 c=sample_labels,
#                 alpha=0.5,
#                 s=2)
#     plt.colorbar()
#     plt.show()

#---------------NOISE GENERATOR FUNCTIONS ------------#

def generate_random_z_vect(seed=523231,size_z=1,scale=1.0):
    VECTOR_DIM = 256
    np.random.seed(seed)
    x = np.random.uniform(low=(scale * -1.0), high=scale, size=(size_z,VECTOR_DIM))
    return x

# def generate_z_vect_from_perlin_noise(seed=1001, size_z=1, scale=1.0):
#     np.random.seed(seed)
#     x = generate_perlin_noise_2d((size_z, VECTOR_DIM), (1,1))
#     x = x*scale
#     return x
#
# def generate_z_vect_from_fractal_noise(seed=1001, size_z=1, scale=1.0,):
#     np.random.seed(seed)
#     x = generate_fractal_noise_2d((size_z, VECTOR_DIM), (1,1),)
#     x = x*scale
#     return x


#-------SPECTROGRAM AND SOUND SYNTHESIS UTILITY FUNCTIONS -------- #

#Assembling generated Spectrogram chunks into final Spectrogram
def specass(a,spec):
  but=False
  con = np.array([])
  nim = a.shape[0]
  for i in range(nim-1):
    im = a[i]
    im = np.squeeze(im)
    if not but:
      con=im
      but=True
    else:
      con = np.concatenate((con,im), axis=1)
  diff = spec.shape[1]-(nim*shape)
  a = np.squeeze(a)
  con = np.concatenate((con,a[-1,:,-diff:]), axis=1)
  return np.squeeze(con)

#Splitting input spectrogram into different chunks to feed to the generator
def chopspec(spec):
  dsa=[]
  for i in range(spec.shape[1]//shape):
    im = spec[:,i*shape:i*shape+shape]
    im = np.reshape(im, (im.shape[0],im.shape[1],1))
    dsa.append(im)
  imlast = spec[:,-shape:]
  imlast = np.reshape(imlast, (imlast.shape[0],imlast.shape[1],1))
  dsa.append(imlast)
  return np.array(dsa, dtype=np.float32)

#Converting from source Spectrogram to target Spectrogram
#path='../content/'
def towave_reconstruct(spec, spec1, name, path='.', show=False, save=False):
  specarr = chopspec(spec)
  specarr1 = chopspec(spec1)
  print(specarr.shape)
  a = specarr
  print('Generating...')
  ab = specarr1
  print('Assembling and Converting...')
  a = specass(a,spec)
  ab = specass(ab,spec1)
  awv = deprep(a)
  abwv = deprep(ab)
  if save:
    print('Saving...')
    pathfin = f'{path}/{name}'
    sf.write(f'{pathfin}.wav', awv, sr)
    print('Saved WAV!')
  #IPython.display.display(IPython.display.Audio(np.squeeze(abwv), rate=sr))
  #IPython.display.display(IPython.display.Audio(np.squeeze(awv), rate=sr))
  if show:
    # fig, axs = plt.subplots(ncols=2)
    # axs[0].imshow(np.flip(a, -2), cmap=None)
    # axs[0].axis('off')
    # axs[0].set_title('Reconstructed')
    # axs[1].imshow(np.flip(ab, -2), cmap=None)
    # axs[1].axis('off')
    # axs[1].set_title('Input')
    # plt.show()
   return abwv

#Converting from Z vector generated spectrogram to waveform
def towave_from_z(spec, name, path='./', show=False, save=True):
  specarr = chopspec(spec)
  print(specarr.shape)
  a = specarr
  print('Generating...')
  print('Assembling and Converting...')
  a = specass(a,spec)
  awv = deprep(a)
  if save:
    print('Saving...')
    pathfin = f'{path}/{name}'
    sf.write(f'{pathfin}.wav', awv, sr)
    print('Saved WAV!')
  #IPython.display.display(IPython.display.Audio(np.squeeze(awv), rate=sr))

  return awv

def interpolate_points(p1, p2,scale, n_steps=10):
	# interpolate ratios between the points
    #Return evenly spaced numbers over a specified interval.
    #Returns num evenly spaced samples, calculated over the interval [start, stop]
	ratios = linspace(-scale, scale, num=n_steps)
	# linear interpolate vectors
	vectors = list()
	for ratio in ratios:
		v = (1.0 - ratio) * p1 + ratio * p2
		vectors.append(v)
	return asarray(vectors)
# if __name__ == "__main__":
#     with open('/Volumes/o0o0o/ai_data/arca.npy', 'rb') as f:
#         data_to_train = np.load(f)
#
# vae = VAE.load("model")
# num_spec_to_resynthesize =  1 #@param {type:"integer"}
#
# num_sample_spec_to_show = num_spec_to_resynthesize
# sample_spec, _ = select_spec(data_to_train, data_to_train, num_sample_spec_to_show)
# reconstructed_spec, _ = vae.reconstruct(sample_spec)
# #plot_reconstructed_spec(sample_spec, reconstructed_spec)
#
# reconst = num_sample_spec_to_show
#
# for i in range(reconst):
#   y = towave_reconstruct(reconstructed_spec[i],sample_spec[i],name=f'reconstructions_{i}',show=False, save=True)
