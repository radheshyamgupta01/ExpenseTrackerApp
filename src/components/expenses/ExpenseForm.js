import React, { useEffect, useState,useCallback } from 'react';
import styles from './ExpenseForm.module.css';
import classes from "./styles.module.css";
import ExpenseList from './ExpenseList';
import { useDispatch, useSelector } from 'react-redux';
import { expenseAction } from '../../store/expenseSlice'
import { toggleDarkMode } from '../../store/themeSlice';
import { CSVLink } from 'react-csv';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [moneySpent, setMoneySpent] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [premium, setPremium]= useState(false);
  const [premiumActive, setPremiumActive]= useState(false);
  const [csvData, setCsv] = useState("No Data");
  const [isEdit, setEdit] = useState(false);
  const [expenseId, setExpenseId] = useState(null);
  const userEmail= localStorage.getItem("email");
  
  const dispatch= useDispatch();
  const darkMode = useSelector(state => state.theme.darkMode);


  const handleSubmit = (e) => {
    e.preventDefault();

    if (isEdit === true) {    
      const expenseData = {
        amount: moneySpent,
        description: description,
        category: selectedCategory,
      };
      dispatch(expenseAction.addAmount(moneySpent));
      dispatch(expenseAction.addDesc(description));
      dispatch(expenseAction.addCategory(selectedCategory));
      fetch(
        `https://e-commerse-23b6e-default-rtdb.firebaseio.com/userExpenses${userEmail}/${expenseId}.json`,
        {
          method: "PUT",
          body: JSON.stringify(expenseData),
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
        .then((response) => {
          setEdit(false);
          console.log(response);
          fetchExpenses();
        })
        .catch((err) => {
          alert("Not able to edit successfully - " + err);
        });
    } else{
       const expenseData={
      amount:moneySpent,
      description:description,
      category:selectedCategory
    }
    dispatch(expenseAction.addAmount(moneySpent));
    dispatch(expenseAction.addDesc(description));
    dispatch(expenseAction.addCategory(selectedCategory));  

    fetch(
      `https://e-commerse-23b6e-default-rtdb.firebaseio.com/userExpenses${userEmail}.json`,
      {
        method: "POST",
        body: JSON.stringify(expenseData),
        headers: {
          "Content-Type": "application/json",
        }
      }
    ).then((response) => {
      if (!response.ok) {
        throw new Error('Something went wrong!');
      }
      return response.json();
    })
    .then((data) => {
      console.log('Expense added successfully!', data);
      const expenseDataWithId={...expenseData, id:data.name}
      setExpenses((prevExpenses)=>[...prevExpenses, expenseDataWithId]); 
     fetchExpenses();
    })
    .catch((error) => {
      console.error('Error adding expense:', error);
      alert('Error adding expense');
    });
  }
    setMoneySpent('');
    setDescription('');
    setSelectedCategory('');
  };

    const fetchExpenses = useCallback(() => {
      fetch(
        `https://e-commerse-23b6e-default-rtdb.firebaseio.com/userExpenses${userEmail}.json`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
.then((response) => {
          if (response.ok) {
           response.json().then((data) => {
            console.log(data);
            let arr = [];
            for (let key in data) {
              arr.push({
                id:key,
                description: data[key].description,
                amount: data[key].amount,
                category: data[key].category,
              });
            }
            setCsv(arr);
            setExpenses(arr);
            localStorage.setItem("allExpense", JSON.stringify(arr));
            dispatch(expenseAction.addExpenses(expenses));
          })
          } else {
            response.json().then((data) => {
              let errorMessage = "Add Expense Failed!!";
              if (data && data.error && data.error.message) {
                errorMessage = data.error.message;
              }
              throw new Error(errorMessage);
            });
          }
        }).catch((err) => {
          console.log(err);
        });
    },[dispatch, userEmail, expenses]);

    useEffect(()=>{
    fetchExpenses();
  },[])

  const editHandler =(id)=>{
    let editExpense = expenses.filter((expense) => {
      return expense.id === id;
    });
    setEdit(true);
    setExpenseId(id);
    setMoneySpent(editExpense[0].amount);
    setDescription(editExpense[0].description);
    setSelectedCategory(editExpense[0].category);
    console.log(editExpense);
  };
  

  const deleteHandler=(id)=>{
    fetch(`https://e-commerse-23b6e-default-rtdb.firebaseio.com/userExpenses${userEmail}/${id}.json`,{
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      }
    }).then((response) => {
      console.log(response);
      setExpenses((expense)=> expense.filter((item)=>item.id!==id));
    }).catch((err) => {
      alert("Expense not deleted!! "+ err);
    });
  }

  useEffect(()=>{
   for(let i=0; i<expenses.length; i++){
    if(expenses[i].amount > 10000 && premiumActive===false){
      setPremium(true);
      break;
    }else{
      setPremium(false)
    }
   }
  },[expenses,premiumActive])

  const activatePremiumHandler=()=>{
    if(premium===true){
      setPremiumActive(true);
    setPremium(false);
    }else{
      setPremiumActive(false);
    }
  }

  let header = [
    {
      label: "Amount",
      key: "amount",
    },
    {
      label: "Description",
      key: "description",
    },
    {
      label: "Category",
      key: "category",
    },
  ];

  return (
    <div className={styles.container}>
    <div  className={darkMode ? `${styles.expenseForm} ${classes.darkTheme}` : styles.expenseForm}>
    <div className={styles.formHeader}><h2>Expense Tracker</h2>
   {premiumActive && <button className={styles.themeBtn} onClick={() => dispatch(toggleDarkMode())}>
    Toggle Dark Mode
  </button>}
  </div>
      
      <form onSubmit={handleSubmit}>
       
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
         <input
          type="number"
          placeholder="Enter Amount"
          value={moneySpent}
          onChange={(e) => setMoneySpent(e.target.value)}
          required
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          required
        >
          <option value="" disabled>Select Category</option>
          <option value="Food">Food</option>
        
          <option value="Petrol">Petrol</option>
          
          <option value="Other">Other</option>
        </select>
        <button  className={styles.submitBtn} type="submit">Add Expense</button>
      </form>
      <ExpenseList expenses={expenses} editHandler={editHandler} deleteHandler={deleteHandler} />
      <div>
      {premium && <button className={styles.premiumBtn} onClick={activatePremiumHandler}>Activate Premium</button>}

      {premiumActive && <button className={styles.csvBtn}><CSVLink data={csvData} headers={header} filename="expenses.csv">
           Download Expense File
         </CSVLink></button>}
      </div>
     
    </div>
    </div>
  );
};

export default Expenses;
