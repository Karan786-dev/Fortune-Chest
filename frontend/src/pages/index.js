import Head from 'next/head'
import { Inter } from 'next/font/google'
import { useEffect } from 'react'
import { useRouter } from 'next/router'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  let router = useRouter()
  useEffect(()=>{
     router.push('/dashboard')
  },[])
  return (
    <>
      <Head>
        <title>Fortune Chest</title>
        <meta name="description" content="Invest an earn 2x Daily" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
    </>
  )
}
