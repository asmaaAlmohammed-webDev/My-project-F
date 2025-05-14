import FeaturesSection from "../components/FeaturesSec/FeaturesSec"
import Hero from "../components/Hero/Hero"
import NewArrivalsSec from "../components/NewArrivalsSec/NewArrivalsSec"
import PopularBooksSec from "../components/PopularBooksSec/PopularBooksSec"


const Home = () => {
  return (
    <main>
        <Hero />
      <PopularBooksSec />
      <NewArrivalsSec />
      <FeaturesSection/>
      
    </main>
  )
}

export default Home
