import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';
import { Home, Login, Register,ForgotPassword,Profile,EditProfile,ContactDeveloper, Device, AddDevice,EditDevice, GitHub, MapComponent } from './components/allComponents';
import Layout from './Layout';
import { Provider } from 'react-redux';
import store from './Store/store';




//Setting up React router
const router = createBrowserRouter(//This will Create a Router

  createRoutesFromElements(//As the Spelling says it will create routes fromt eh elements given to the path given

    <Route path="/" element={<Layout />}>{/*this means that '/' is linked with the Component <Layout/>*/}
      <Route path="/" element={<Home />} />{/*this means that '/' is linked with the Component <Home/> this ensures that our landing page is Home Page*/}
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
      <Route path="editProfile" element={<EditProfile />} />
      <Route path="profile" element={<Profile />} />
      <Route path="contact" element={<ContactDeveloper />} />
      <Route path="forgotPassword" element={<ForgotPassword />} />

      <Route path="addDevice" element={<AddDevice />} />
      <Route path="device/:deviceId" element={<Device />} />{/*Passing Two Props*/}
      <Route path="editDevice/:deviceId" element={<EditDevice />} />{/*Passing Two Props*/}
      <Route path="github" element={<GitHub />} />
      <Route path="map/:coordinates" element={<MapComponent />} />
    </Route>
  )
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>{/* Store Provider */}

      <RouterProvider router={router} />{/*this provides the routes which was created above to be rendered this provides routes.*/}

    </Provider>
  </StrictMode>
);
