import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'

import 'highlight.js/styles/github-dark.css'

const Markdown = ({
  content = '',
  className = '',
  size = 'sm',
  allowHeadings = true,
  allowLists = true,
  allowCode = true,
  disallowedElements = ['img'],
  skipHtml = true,
}) => {
  const sizes = {
    sm: 'prose-sm',
    base: 'prose',
    lg: 'prose-lg',
  }

  const components = {
    ...(allowHeadings
      ? {}
      : {
          h1: () => null,
          h2: () => null,
          h3: () => null,
          h4: () => null,
          h5: () => null,
          h6: () => null,
        }),

    ...(allowLists
      ? {}
      : {
          ul: () => null,
          ol: () => null,
          li: () => null,
        }),

    ...(allowCode
      ? {}
      : {
          pre: () => null,
          code: () => null,
        }),

    p: props => (
      <p
        className="mb-4 leading-7 text-slate-300"
        {...props}
      />
    ),

    a: props => (
      <a
        {...props}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-400 transition hover:text-blue-300 hover:underline"
      />
    ),

    blockquote: props => (
      <blockquote
        className="
          my-5
          border-l-4
          border-blue-500
          bg-slate-800/50
          py-2
          pl-5
          italic
          text-slate-300
        "
        {...props}
      />
    ),

    code({ inline, className, children, ...props }) {
      if (inline) {
        return (
          <code
            className="
              rounded-md
              bg-slate-800
              px-1.5
              py-1
              text-[13px]
              text-blue-300
            "
            {...props}
          >
            {children}
          </code>
        )
      }

      return (
        <code
          className={className}
          {...props}
        >
          {children}
        </code>
      )
    },

    pre: props => (
      <pre
        className="
          my-5
          overflow-x-auto
          rounded-xl
          border
          border-slate-700
          bg-[#0d1117]
          p-4
        "
        {...props}
      />
    ),

    img: props => (
      <img
        {...props}
        className="my-5 rounded-xl"
      />
    ),

    table: props => (
      <div className="overflow-x-auto">
        <table
          className="w-full border-collapse"
          {...props}
        />
      </div>
    ),

    th: props => (
      <th
        className="border border-slate-700 bg-slate-800 px-4 py-2 text-left"
        {...props}
      />
    ),

    td: props => (
      <td
        className="border border-slate-700 px-4 py-2"
        {...props}
      />
    ),
  }

  return (
    <div
      className={`
        prose
        ${sizes[size]}
        prose-invert
        max-w-none
        prose-headings:text-white
        prose-p:text-slate-300
        prose-strong:text-white
        prose-li:text-slate-300
        prose-code:before:content-none
        prose-code:after:content-none
        ${className}
      `}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={allowCode ? [rehypeHighlight] : []}
        disallowedElements={disallowedElements}
        skipHtml={skipHtml}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

export default Markdown

