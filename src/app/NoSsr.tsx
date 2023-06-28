import dynamic from 'next/dynamic'

function NoSSRWrapper(props: any) {
  return props.children
}

export default dynamic(() => Promise.resolve(NoSSRWrapper), {
  ssr: false,
})
