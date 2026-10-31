import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * A hook that provides a GSAP context tied to a ref'd DOM element.
 * All animations created inside the callback are automatically cleaned up on unmount.
 *
 * Usage:
 *   const el = useGsap((gsap, el) => {
 *     gsap.from(el, { opacity: 0, y: 40 })
 *   }, [dep1, dep2])
 *
 * @param {Function} callback - receives (gsap, element, ScrollTrigger)
 * @param {Array} deps - dependency array (like useEffect)
 * @returns {React.RefObject} ref to attach to a container element
 */
export function useGsap(callback, deps = []) {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current) return

    const ctx = gsap.context(() => {
      callback(gsap, ref.current, ScrollTrigger)
    }, ref)

    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return ref
}
