

const Button = ({id,text, color, onClick}) => {
  return(
        <button id={id}
        onClick={onClick}
        style={{ backgroundColor: color, visibility:"visible" }}>
        {text}
        </button>
  )
}

export default Button
