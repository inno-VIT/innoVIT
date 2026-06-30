const HorizontalStack = ({
  children,
  className = '',
  spacing = 4,
  ...props
}) => {
  return (
    <div
      className={`flex flex-row items-center space-x-${spacing} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export default HorizontalStack
