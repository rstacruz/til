import React from 'react'
import { HastNode } from '../types'
import makeToReact from '../helpers/to_react'
import 'typeface-public-sans'
import H2Section from './lib/H2Section'
import H3Section from './lib/H3Section'
import PreCode from './lib/PreCode'
import MarkdownStyles from './lib/MarkdownStyles'

const Div = ({ children, ...props }) => <div {...props}>{children}</div>

const toReact = makeToReact({
  components: {
    'h2-body': Div,
    'h2-section': H2Section,
    'h3-body': Div,
    'h3-section': H3Section,
    'multi-comparison': Div,
    'next-block': Div,
    pre: PreCode
  }
})

interface Props {
  title: string
  date: string | void
  body: HastNode[]
}

const SimplePostContent = (props: Props) => {
  const { title, date, body: sections } = props
  return (
    <div className='SimplePostContent'>
      <h1 className='title'>{title}</h1>
      {date ? <h5>{date}</h5> : null}
      <MarkdownStyles>{sections.map(body => toReact(body))}</MarkdownStyles>

      <style jsx>{`
        @import 'src/css-utils/ms.css';
        @import 'src/css-utils/container.css';
        @import 'src/css-utils/thin-scrollbar.css';
        @import 'src/css-utils/type.css';

        .SimplePostContent {
          @apply container leading-relaxed antialiased;
          @apply type-body-sans;
          color: #181818;
        }

        .title {
          @apply ms-6 mt-32 mb-4 type-thin-heading text-gray-700;
          color: #705075;
        }
      `}</style>
    </div>
  )
}

export default SimplePostContent