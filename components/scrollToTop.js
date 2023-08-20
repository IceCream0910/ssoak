import IonIcon from '@reacticons/ionicons'
import { useState, useEffect } from 'react'

export default function ScrollToTop() {

    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 300) {
                setIsVisible(true)
            } else {
                setIsVisible(false)
            }
        }

        window.addEventListener('scroll', toggleVisibility)

        return () => window.removeEventListener('scroll', toggleVisibility)
    }, [])

    const handleScroll = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        })
    }

    return (
        <button onClick={handleScroll} className={`scroll-top-btn ${isVisible ? '' : 'invisible'}`}>
            <IonIcon name="arrow-up-outline" size="large" />
        </button>
    )
}