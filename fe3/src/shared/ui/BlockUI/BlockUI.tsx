export const buiStyle: { [key: string]: React.CSSProperties } = {
  uiBox: {
    position: 'relative',
  },
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    opacity: 0.5,
    zIndex: 999,
  },
  panel: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#49494990',
    color: '#fff',
    padding: '20px 60px',
    borderRadius: '8px',
    fontSize: '2.5rem',
    textAlign: 'center',
    zIndex: 1000,
  },
};

export const BlockUI = ({ text = 'Please wait...' }) => {
  return (
    <>
    <div style={buiStyle.overlay}></div>
    <div style={buiStyle.panel}>{text}</div>
    </>
  )
}