let finalURL;
let result;
const apiKey = 'd8739849e9msh9de0a072a19f9edp1762cejsne12be3c09936';
const apiHost = "spoonacular-recipe-food-nutrition-v1.p.rapidapi.com";
const mealGenURL = 'https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/mealplans/generate?timeFrame=day&';

//adds
const fetchResults = (urlString) => {
return  fetch(urlString, {headers: {
'x-rapidapi-key': apiKey,
'X-RapidAPI-Host': apiHost
}}) .then(response => {
  if (response.ok) {
    return response.json();
  }
  
  throw new Error(response.statusText);
})
.then(responseJson=>responseJson)
.catch(err => {
  console.log(err);
  $('#mealResults').text(`Something went wrong: ${err.message}`);
 });
}

function formatMealGenParams(params) {
    //create an array of the keys in the "params" object
    const queryItems = Object.keys(params)
      //for each of the keys in that array, create a string with the key and the key's value in the "params" object
      .map(key => `${key}=${params[key]}`)
    //return a string of the keys and values, separated by "&"
    return queryItems.join('&');
}
  
async function setMealResults(){
    console.log("line 33 are you here first API call url?", finalURL);
   const response= await fetchResults(finalURL);
   const responseMeals=response.meals;
   result= responseMeals;
console.log("did this work",result);
return result;
   
}
 async function buildFinalResults(){
  await setMealResults();
  console.log("did this persist", result);
  // .then(res=> result= res.meals)
   for(let i=0; i<result.length; i++){
         const recipeURL = `https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/${result[i].id}/information`;
   const recipeLinks= await fetchResults(recipeURL);
   console.log("this is the results",recipeLinks.image);
   result[i]["recipe_url"]=recipeLinks.sourceUrl
   result[i]["summary"]=recipeLinks.summary
   result[i].imageUrls=recipeLinks.image


   }
   console.log("this is the result now", result);
   return result
 }

function getMealPlanQuery(mealCals, mealDiet) {
  //create the query parameters
  let params;
  if(mealDiet === ""){
    params = {
      //set the "targetCalories" parameter equal to the value the user input, same with diet
      targetCalories: mealCals,
    };
  }else{
    params = {
      //set the "targetCalories" parameter equal to the value the user input, same with diet
      targetCalories: mealCals,
      diet: mealDiet
    };
  }
    //create a string with the original URL and the new parameters
    const queryString = formatMealGenParams(params)
    finalURL = mealGenURL + queryString;
}
async function renderResults(){
  await buildFinalResults();
  $('#mealResults').empty();

  let foodResults;
  if(result.length===0){
    foodResults= `<div>
    <p>We can not generate a meal plan with the selected calorie and diet
    input, please try again</p>
    </div>`
  }else{
    foodResults= result.map(item=>{
      return  `<div>
       <p>${item.title}</p>
       <p>Minutes: ${item.readyInMinutes}</p>
       <p>Servings: ${item.servings}</p>
       <a href=${item.recipe_url}><img src=${item.imageUrls}>
       </a> 
       <p>${item.summary}</p>
       </div>`
     })
  }


  $('#mealResults').append(foodResults);
}
function getMealPlan(){
    $('form').submit(event => {
    event.preventDefault();
    const dailyCals = $('#js-dailycals').val();
    const dietRestricts = $('#js-dietRestrict').val();
    getMealPlanQuery(dailyCals, dietRestricts);
    renderResults();
    });
    
}

getMealPlan();

