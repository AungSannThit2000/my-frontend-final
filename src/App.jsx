import './App.css'
import { Navigate, Route, Routes } from 'react-router-dom';
import RequireAuth from './middleware/RequireAuth';
import Login from './components/Login';
import Logout from './components/Logout';
import Books from './components/Books';
import { BookDetail } from './components/BookDetail';
import BookBorrow from './components/BookBorrow';

function App() {

  return(
    <Routes>
      <Route path='/' element={<Navigate to='/login' replace />} />
      <Route path='/login' element={<Login/>}/>
      <Route path='/logout' element={
        <RequireAuth>
          <Logout/>
        </RequireAuth>
      }/>
      <Route path='/books' element={
        <RequireAuth>
          <Books />
        </RequireAuth>
      } />
      <Route path='/books/:id' element={
        <RequireAuth>
          <BookDetail />
        </RequireAuth>
      } />
      <Route path='/borrow' element={
        <RequireAuth>
          <BookBorrow />
        </RequireAuth>
      } />
      <Route path='*' element={<Navigate to='/login' replace />} />
    </Routes>
  );
}

export default App
