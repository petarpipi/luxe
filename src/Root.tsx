import { StrictMode } from 'react'
import { LazyMotion, MotionConfig, domAnimation } from 'motion/react'
import App from './App'

export default function Root() {
  return (
    <StrictMode>
      <LazyMotion features={domAnimation} strict>
        <MotionConfig reducedMotion="user">
          <App />
        </MotionConfig>
      </LazyMotion>
    </StrictMode>
  )
}
