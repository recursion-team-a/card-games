import Link from 'next/link'
import React, { useState, useEffect } from 'react'
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/scrollbar'
import './slider.css'

interface GameLinkProps {
  id: number
  title: string
  ruleLink: string
  playLink: string
}

interface SliderProps {
  games: GameLinkProps[]
}

function Slider({ games }: SliderProps) {
  const [slidesPerView, setSlidesPerView] = useState(3)

  useEffect(() => {
    const updateSlidesPerView = () => {
      const windowWidth = window.innerWidth

      if (windowWidth <= 800) {
        setSlidesPerView(1)
      } else if (windowWidth <= 1200) {
        setSlidesPerView(2)
      } else {
        setSlidesPerView(3)
      }
    }

    updateSlidesPerView()
    window.addEventListener('resize', updateSlidesPerView)

    return () => {
      window.removeEventListener('resize', updateSlidesPerView)
    }
  }, [])
  return (
    <Swiper
      modules={[Navigation, Pagination, Scrollbar, A11y]}
      spaceBetween={50}
      slidesPerView={slidesPerView}
      navigation
      pagination={{ clickable: true }}
      scrollbar={{ draggable: true }}
    >
      {games.map((game) => (
        <SwiperSlide className='slide-content' key={game.id}>
          <div className='wrapper'>
            <div className='slide-container swiper'>
              <div className='slide-content'>
                <div className='card-wrapper swiper-wrapper'>
                  <div className='card swiper-slide'>
                    <div className='card-content'>
                      <h2 className='name font-semibold text-xl text-center'>{game.title}</h2>
                      <Link href={game.ruleLink} legacyBehavior>
                        <button type='button' className='button'>
                          RULE
                        </button>
                      </Link>
                      {/* TUTORIALのリンクをruleリンクにしています */}
                      <Link href={game.tutorialLink} legacyBehavior>
                        <button type='button' className='button'>
                          TUTORIAL
                        </button>
                      </Link>
                      <Link href={game.playLink} legacyBehavior>
                        <button type='button' className='play-button'>
                          PLAY
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  )
}

export default Slider
