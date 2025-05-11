import { Header, Footer } from './components/allComponents'
import { Outlet } from 'react-router-dom'


function Layout() {
  return (
    <>
      <Header />{/*Header and Footer is Always Rendered but the Middle thing is changed by the outlet which ever gets redered using React Router */}
      <Outlet />
      <Footer />
    </>
  )
}

export default Layout