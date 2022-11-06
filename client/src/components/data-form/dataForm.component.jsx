import React, { useContext, useEffect, useState } from 'react';
import UserContext from '../../utilities/contexts/userContexts/userContext';
import DropDown from '../dropdown/dropdown.component';
import Form from '../form/f orm.component';
import Input from '../input/input.component';
import './dataForm.styles.css';

const DataForm = ({ data: { crudName, inputFields }, setValData }) => {
  const [docRefs, setDocRefs] = useState('');
  const [permissions, setPermissions] = useState([]);
  const [roles, setRoles] = useState([]);
  const crudItems = useContext(UserContext);

  useEffect(() => {
    if (crudName === 'roles') {
      fetch('https://modular-ap.herokuapp.com/api/data/permissions')
        .then(res => res.json())
        .then(data => setPermissions([...data.data]));
    }
    if (crudName === 'users') {
      fetch('https://modular-ap.herokuapp.com/api/data/roles')
        .then(res => res.json())
        .then(data => setRoles([...data.data]));
    }
  }, [crudName]);

  const initObj = {};
  inputFields.forEach(inpObj => {
    initObj[inpObj['name']] = '';
  });
  const [inputVals, setInputVals] = useState(initObj);
  const changeData = e => {
    const newInputVals = {
      ...inputVals,
      [e.target.name]: e.target.value,
    };

    setInputVals({ ...newInputVals });
  };

  const sendData = async e => {
    e.preventDefault();
    const dataPopulated = inputFields.every(obj => {
      if (inputVals[obj['name']] || !inputVals['docRef']) return true;
      else return false;
    });
    if (!dataPopulated) {
      alert('please fill up the full form');
      return;
    }
    await fetch(`https://modular-ap.herokuapp.com/api/data/${crudName.toLowerCase()}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(inputVals),
    });

    const dataRes = await fetch(
      `https://modular-ap.herokuapp.com/api/data/${crudName.toLowerCase()}`
    );
    const data = await dataRes.json();
    setValData(data.data);
  };

  const changeDropdVal = e => {
    const { target } = e;
    const { value, name, options, selectedIndex } = target;
    const selectedVal = value;
    if (name === 'permissions') {
      setInputVals({
        ...inputVals,
        [name]: [value],
      });
      return;
    }
    if (name === 'role') {
      setInputVals({
        ...inputVals,
        [name]: options[selectedIndex].text,
      });
      return;
    }
    setInputVals({
      ...inputVals,
      [name]: value,
    });
    if (name.includes('collection')) {
      fetch(`https://modular-ap.herokuapp.com/api/data/${selectedVal.toLowerCase()}`)
        .then(rest => rest.json())
        .then(data => setDocRefs(data.data));
    }
  };

  const checkBoxChange = e => {
    const { value, checked, name } = e.target;

    if (checked) {
      setInputVals({
        ...inputVals,
        [name]: [...inputVals[name], value],
      });
    } else {
      const newVal = inputVals[name].filter(val => val !== value);
      setInputVals({
        ...inputVals,
        [name]: [...newVal],
      });
    }
  };

  return (
    <Form>
      {inputFields.map((obj, i) => {
        if (obj.type === 'dropdown' && crudName === 'permissions') {
          const isCollection = obj.name.includes('collection');
          return (
            <div key={i + 1} className="drop-down-block">
              <DropDown
                {...obj}
                changeVal={changeDropdVal}
                opt={isCollection ? crudItems : []}
                docs={docRefs}
                prop={docRefs[0] ? 'title' : ''}
              />
            </div>
          );
        }
        if (obj.type === 'dropdown' && crudName === 'roles' && permissions[0]) {
          return (
            <div key={i + 1} className="drop-down-block">
              <DropDown {...obj} changeVal={changeDropdVal} opt={permissions} prop="title" />
            </div>
          );
        }
        if (obj.type === 'dropdown' && crudName === 'users' && roles[0]) {
          return (
            <div key={i + 1} className="drop-down-block">
              <DropDown {...obj} changeVal={changeDropdVal} opt={roles} prop="title" />
            </div>
          );
        }
        if (obj.type === 'checkbox') {
          return (
            <div key={i + 1} className="checkbox-block">
              {['create', 'read', 'update', 'delete'].map((opt, ind) => {
                return (
                  <Input
                    key={ind + 1}
                    label={opt}
                    inpValue={opt}
                    type={obj.type}
                    name={obj.name}
                    changeData={checkBoxChange}
                    required
                    classname="checkbox-input-container"
                  />
                );
              })}
            </div>
          );
        }
        if (obj.type !== 'dropdown') {
          return (
            <Input
              key={i + 1}
              {...obj}
              changeData={changeData}
              required
              inpValue={inputVals[obj.name]}
            />
          );
        }
      })}
      <button
        type="submit"
        className="btn-submit data-submit"
        onClick={e => {
          sendData(e);
        }}
      >
        Submit
      </button>
    </Form>
  );
};
export default DataForm;
