import Button from './Button'


const Header = (title) => {

  const onClick = () => {
    console.log('clicked')
  }

  return (
    <header>
    <h1>{title.title}</h1>
    <h2>Generate Random Point in Latent Space</h2>
    <Button text='Generate' color='white' onClick={onClick}/>
    <h2>Generate Long Sample in Latent Space</h2>
    <Button text='Generate' color='white' onClick={onClick}/>
    <h2>Interpolate between two points</h2>
    <Button text='Generate' color='white' onClick={onClick}/>
    <h2>XY Coordinate Plane for User Interaction</h2>
    <Button text='Generate' color='white' onClick={onClick}/>
    <h2>Stream input from Live Data sources</h2>
    <Button text='Generate' color='white' onClick={onClick}/>
    </header>
  )
}

export default Header
