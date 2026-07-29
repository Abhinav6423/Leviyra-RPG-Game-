import React from 'react'
import HeroChar from '../../components/hero-section/HeroChar'
import CharacterGrid from '../../components/characters/CharcterGrid'

const Home = () => {
    return (
        <>
            {/* HERO */}
            <div className="">
                <HeroChar />
            </div>

            {/* CHARACTERS */}
            <div className=" md:mt-10 pb-24 lg:pb-0">
                <CharacterGrid />
            </div>
        </>
    )
}

export default Home