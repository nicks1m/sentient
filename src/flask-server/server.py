from flask import Flask
from flask import request, send_from_directory
import numpy as np
from numpy import linspace
import os
from autoencoder import VAE
from wave2spec import select_spec,towave_reconstruct,towave_from_z, generate_random_z_vect, testass, interpolate_points
import codecs, json, base64
import tensorflow as tf
from tensorflow.python.keras.backend import set_session
#import keras
#from tensorflow.keras.models import load_model

#this is to ensure they are running on the same graph/thread and session
sess = tf.compat.v1.Session()
graph = tf.compat.v1.get_default_graph()

app = Flask(__name__)
set_session(sess)
#vae = load_model('weights.h5', custom_objects={'auc':'auc'})
vae = VAE.load("model")
vae.summary()

with open('./timhecker.npy', 'rb') as f:
    data_to_train = np.load(f)
    print("data ready")


@app.route("/fetch_audio")
def fetch_audio():
    return send_from_directory("./",
                               "interp.wav", as_attachment=True)


@app.route("/generatefromz")
def generatez():
    global graph
    global sess
    # z = vae.generate_random_point_latent_space()
    # sampled_point = np.array(vae.sample_from_latent_space(z))
    scale_z_vectors = 1.5;
    seed = np.random.rand() * 10000;
    z_vect = generate_random_z_vect(int(seed),1,scale_z_vectors)
    with graph.as_default():
        set_session(sess)
        z_sample = np.array(vae.sample_from_latent_space(z_vect))
        assembled_spec = testass(z_sample)
        print("sampled")
        audio = towave_from_z(assembled_spec,"tmp")
        print("audiosaved")
    with open("tmp.wav", "rb") as a:
        wav = a.read()
    wav_file = base64.b64encode(wav).decode('UTF-8')
    data = {"audio":wav_file}
    res = app.response_class(response=json.dumps(data),
     status =200,
     mimetype='application/json')
    os.remove("./tmp.wav")
    #sp = json.dumps(sampled_point.tolist())
    return res

@app.route("/resynthesis")
def resynthesis():
    global graph
    global sess
    num_sample_spec_to_show = 1
    i = 0 #index of sample
    sample_spec, _ = select_spec(data_to_train, data_to_train, num_sample_spec_to_show)
    with graph.as_default():
        set_session(sess)
        reconstructed_spec, _ = vae.reconstruct(sample_spec)
        y = towave_reconstruct(reconstructed_spec[i],sample_spec[i],name=f'reconstructions_{i}',show=False, save=True)
    with open("reconstructions_0.wav", "rb") as a:
        wav = a.read()
    wav_file = base64.b64encode(wav).decode('UTF-8')
    data = {"audio":wav_file}
    res = app.response_class(response=json.dumps(data),
     status =200,
     mimetype='application/json')
    return res



@app.route("/interpolate",methods=['GET','POST'])
def interpolate():
    if request.method == 'POST':
        data = request.json
        print(data)
        scale_interpolation_ratio =  4
        num_interpolation_steps =   8
        scale_z_vectors =  1.5
        global graph
        global sess
        with graph.as_default():
            set_session(sess)
            #y = np.random.randint(0, 2**32-1)
            pt_a = generate_random_z_vect(int(data["seed1"]),1,scale_z_vectors)
            pt_b = generate_random_z_vect(int(data["seed2"]),1,scale_z_vectors)
            interpolated = interpolate_points(pt_a[0], pt_b[0], scale_interpolation_ratio, num_interpolation_steps)
            interp = np.array(vae.sample_from_latent_space(interpolated))
            assembled_spec = testass(interp)
            towave_from_z(assembled_spec,"interp")
            with open("interp.wav", "rb") as a:
                wav = a.read()
            wav_file = base64.b64encode(wav).decode('UTF-8')
            data = {"audio":wav_file}
            res = app.response_class(response=json.dumps(data),
             status =200,
             mimetype='application/json')
    return res





if __name__ == "__main__":
    app.run(debug=True)
