let finalURL;
let result= new Object();
const apiKey = 'd8739849e9msh9de0a072a19f9edp1762cejsne12be3c09936';
const apiHost = "spoonacular-recipe-food-nutrition-v1.p.rapidapi.com";
const mealGenURL = 'https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/mealplans/generate?timeFrame=day&';

//function to pass MealGenURL and recipeURL to make fetch call to spoonacular API w/ headers
const fetchResults = (urlString) => {
return  fetch(urlString, {headers: {
'x-rapidapi-key': apiKey,
'X-RapidAPI-Host': apiHost
}})
.then(response => {
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

function getMealPlanQuery(mealCals, mealDiet) {
  //create the query parameters
  let params;
  //if user doesn't select a diet requirement, then only pass calories parameter
  if(mealDiet === ""){
    params = {
      targetCalories: mealCals,
    };
  }
  else{
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


//function to add parameters into key:value to add to fetch URL
function formatMealGenParams(params) {
    //create an array of the keys in the "params" object
    const queryItems = Object.keys(params)
      //for each of the keys in that array, create a string with the key and the key's value in the "params" object
      .map(key => `${key}=${params[key]}`)
    //return a string of the keys and values, separated by "&"
    return queryItems.join('&');
}

//function that waits till we put fetch finalURL, then puts mealgen array in result variable
async function setMealResults(){
  console.log("line 38 are you here first API call url?", finalURL);
  const response = await fetchResults(finalURL);
  const responseMeals = response.meals;
  const responseNutrients = response.nutrients;
  result.meals=responseMeals
  result.nutrients=responseNutrients
  // Object.assign(meals=responseMeals, nutrients=responseNutrients);
  console.log("did this work",result);
  return result; 
}

//this takes the recipe ID of each meal, fetches the second endpoint with Recipe image, URL, and Description, and adds it to each meal array
async function buildFinalResults(){
 await setMealResults();
 const meals=result.meals
 for(let i=0; i<meals.length; i++){
  const recipeURL = `https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/${meals[i].id}/information`;
  const recipeLinks = await fetchResults(recipeURL);
  meals[i]["recipe_url"] = recipeLinks.sourceUrl
  meals[i]["summary"] = recipeLinks.summary
  meals[i].imageUrls = recipeLinks.image
  }
  console.log("this is the result now", Object.keys(result));
  return result;
}
// function makeImageLink(linkURL, imageURL ){
//   var link = $("<a>");
//   link.attr("href", linkURL);
//   link.addClass("link");
//   link.prepend($('<img>',{src:imageURL}))
//   return link
// }

//waits till buildFinalResults funciton runs, empties out mealResult seciton in HTML, and then creates a div with the meals in the DOM
async function renderResults(){
  await buildFinalResults();
  const meals = result.meals;
  const nutrientInformation =
  `<div>
  <h3>Daily Meal Plan Nutritional Information </h3>
  <p>${result.nutrients.calories} calories</p>
  <p>Protein: ${result.nutrients.protein} grams</p>
  <p>Fat: ${result.nutrients.fat} grams</p>
  <p>Carbs: ${result.nutrients.carbohydrates} grams</p>
  </div>`
  $('#nutrientInfo').empty();
  $('#mealResults').empty();
  let foodResults;
  if(meals.length===0){
    $('#nutrientInfo').empty();
    foodResults= `<div>
    <p>We can not generate a meal plan with that calorie amount and diet, please try again</p>
    </div>`
  } 
  else {
 
    foodResults= meals.map(item=>{
      return  `<div id="mealitem">
      <a href=${item.recipe_url}><p>${item.title}</p></a>
       <p>Minutes: ${item.readyInMinutes}</p>
       <p>Servings: ${item.servings}</p>
       <a href=${item.recipe_url}><img src=${item.imageUrls} /></a>
       <p>${item.summary}</p>
       </div>`
     })
  }
  // ${makeImageLink(item.recipe_url,item.imageUrls)}

  $('#nutrientInfo').append(nutrientInformation);
  $('#mealResults').append(foodResults);
}

//once the Get Meal Plan button gets submited, we grab values from user input, then pass those params, and render the results
function getMealPlan(){
  $('form').submit(event => {
  event.preventDefault();
  const dailyCals = $('#js-dailycals').val();
  const dietRestricts = $('#js-dietRestrict').val();
  var viewportmeta = document.querySelector('meta[name="viewport"]');
  if (viewportmeta) {
     viewportmeta.setAttribute('content', 'width=device-width, maximum-scale=1.0, initial-scale=1.0');
  }
  getMealPlanQuery(dailyCals, dietRestricts);
  renderResults();
  });
}

getMealPlan();