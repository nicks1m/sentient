

const Button = ({id,text, color, border, onClick}) => {
  return(
        <button id={id}
        onClick={onClick}
        style={{
          backgroundColor: color,
          //width: "100px",
          height:"45px",
          display:"block",
          margin:"10px auto",
          padding:"5px 5px",
          visibility:"visible",
          outline:"none",
          borderWidth: border }}>
        {text}
        </button>
  )
}

export default Button
