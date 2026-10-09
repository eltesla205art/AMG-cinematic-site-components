import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Hero from '../sections/Hero'
import Marquee from '../components/Marquee'
import MenuGrid from '../sections/MenuGrid'
import BurgerBuilder from '../sections/BurgerBuilder'
import Story from '../sections/Story'
import FindUs from '../sections/FindUs'
import Checkered from '../components/Checkered'

export default function Home() {
  const { hash } = useLocation()
  useEffect(() => {
    if (!hash) return
    // Wait a frame so sections exist when arriving from another route.
    requestAnimationFrame(() => document.getElementById(hash.slice(1))?.scrollIntoView())
  }, [hash])

  return (
    <>
      <Hero />
      <Marquee />
      <MenuGrid />
      <Checkered />
      <BurgerBuilder />
      <Checkered />
      <Story />
      <Checkered />
      <FindUs />
    </>
  )
}
