const Loading = ({
  label = 'Loading...',
  fullScreen = false,
  className = '',
}) => {
  const content = (
    <div
      className={`
        flex
        flex-col
        items-center
        justify-center
        py-12
        ${className}
      `}
    >
      <div
        className="
          h-12
          w-12
          animate-spin
          rounded-full
          border-4
          border-slate-700
          border-t-blue-500
        "
      />

      {label && (
        <p className="mt-5 text-sm text-slate-400">
          {label}
        </p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080912]">
        {content}
      </div>
    )
  }

  return content
}

export default Loading






// import React from 'react';

// const Loading = () => {
//   return (
//     <div className="flex justify-center items-center py-12">
//       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//     </div>
//   );
// };

// export default Loading;
