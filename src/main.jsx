import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';
import { Home, Login, Register, ForgotPassword, Profile, EditProfile, Feedback, Device, AddDevice, EditDevice, GitHub, MapComponent } from './components/allComponents';
import Layout from './Layout';
import { Provider } from 'react-redux';
import store from './Store/store';
import ProtectedRoute from './ProtectedRoute';




//Setting up React router
const router = createBrowserRouter(//This will Create a Router

  createRoutesFromElements(//As the Spelling says it will create routes fromt eh elements given to the path given

    <Route path="/" element={<Layout />}>{/*this means that '/' is linked with the Component <Layout/>*/}
      <Route path="/" element={<Home />} />{/*this means that '/' is linked with the Component <Home/> this ensures that our landing page is Home Page*/}

      <Route path="login" element={<Login />} />

      <Route path="register" element={<Register />} />

      <Route path="contact" element={<Feedback />} />

      <Route path="forgotPassword" element={<ForgotPassword />} />

      <Route path="github" element={<GitHub />} />

      <Route path="editProfile" element={
        <ProtectedRoute>
          <EditProfile />
        </ProtectedRoute>} />

      <Route path="profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>} />



      <Route path="addDevice" element={
        <ProtectedRoute>
          <AddDevice />
        </ProtectedRoute>} />

      <Route path="device/:deviceId" element={
        <ProtectedRoute>
          <Device />
        </ProtectedRoute>} />

      <Route path="editDevice/:deviceId" element={
        <ProtectedRoute>
          <EditDevice />
        </ProtectedRoute>} />



      <Route path="map/:coordinates/:lastLocation/:geofenceRadius" element={
        <ProtectedRoute>
          <MapComponent />
        </ProtectedRoute>} />
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
