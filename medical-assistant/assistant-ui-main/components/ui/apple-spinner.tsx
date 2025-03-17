import './AppleSpinner.css'
const AppleSpinner = () => {
  return (
    <div className="apple-spinner">
      {/* Create 12 dots (segments) in a loop */}
      {[...Array(12)].map((_, i) => (
        <div key={i} className="apple-spinner__segment" />
      ))}
    </div>
  )
}

export default AppleSpinner
