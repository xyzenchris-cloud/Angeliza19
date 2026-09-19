import twemoji from 'twemoji'

type TwemojiTextProps = {
  children: string
  className?: string
}

function TwemojiText({ children, className = '' }: TwemojiTextProps) {
  const html = twemoji.parse(children, {
    base: 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/',
    folder: 'svg',
    ext: '.svg',
    className: 'twemoji',
  })

  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />
}

export default TwemojiText
