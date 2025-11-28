import { type FC } from 'react'
import { Button } from 'react-bootstrap'
import './InputField.css'

import { useDispatch } from 'react-redux'; 
import { type AppDispatch } from '../store/store';
import { getCommands } from '../store/slices/commandSlice';
import { setSearchQuery } from '../store/filterSlice';

interface Props {
    value: string
    loading?: boolean
    placeholder?: string
    buttonTitle?: string
}

const InputField: FC<Props> = ({ value, loading, placeholder, buttonTitle = 'Искать' }) => {
    const dispatch = useDispatch<AppDispatch>();
    
    return (
    <div className="inputField">
        <input value={value} placeholder={placeholder} onChange={(event => dispatch(setSearchQuery(event.target.value)))}/>
        <Button disabled={loading} onClick={() => dispatch(getCommands({query: value}))}>{buttonTitle}</Button>
    </div>
)}

export default InputField