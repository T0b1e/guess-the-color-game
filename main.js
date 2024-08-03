 // Declare Variable 
 let users = [];

 let targetColor;
 let startTime;
 let hintUsed = false;

 let status;
 let timerInterval; 

 let username;
 let guessCount = 0;
 let score = 0;

 const colorBox = document.getElementById('colorBox');
 const resultElement = document.getElementById('result');
 const scoreElement = document.getElementById('score');
 const redInput = document.getElementById('redInput');
 const greenInput = document.getElementById('greenInput');
 const blueInput = document.getElementById('blueInput');
 const hintBtn = document.getElementById('hintBtn');

 const leaderboardList = document.getElementById('leaderboardList');

 
 // Randomize Color : Get called after startGame()
 function generateRandomColor() {
   const r = Math.floor(Math.random() * 256);
   const g = Math.floor(Math.random() * 256);
   const b = Math.floor(Math.random() * 256);
   return `rgb(${r}, ${g}, ${b})`;
 }

 // Updated Color in the box  : Get called after startGame()
 function updateColorBox(color) {
   colorBox.style.transition = 'none'; 
   colorBox.style.backgroundColor = color;
   void colorBox.offsetWidth; 
   colorBox.style.transition = 'background-color 0.5s ease-in-out'; // Re-enable transition
 }

 // When game ended (User had been guess correctly)
 function clearScreenAndPromptUsername() {
   colorBox.style.backgroundColor = 'white';

   resultElement.innerText = '';
   scoreElement.innerText = ''; // won't reset
   redInput.value = '';
   greenInput.value = '';
   blueInput.value = '';
   hintBtn.disabled = false;
   hintUsed = false;

   colorBox.style.transition = 'background-color 0.5s ease-in-out';
   document.getElementById('usernameModal').style.display = 'block';  // Showing input username modal
   clearInterval(timerInterval); // Reset time
 }

 function clearScreen() {
   setTimeout(() => {
     clearScreenAndPromptUsername();
   }, 3000);
 }

 // main
 function startGame() {
   targetColor = generateRandomColor();
   console.log(targetColor) // CHEAT
   updateColorBox(targetColor);
   startTime = new Date().getTime();
   
   guessCount = 0; 

   fadeInResult('Guess the Color!'); // showing in feedBack.innterText

   redInput.value = '';
   greenInput.value = '';
   blueInput.value = '';
   hintBtn.disabled = false;
   hintUsed = false;

   timerInterval = setInterval(() => {
       updateTimer('update'); // setting status of updateTimer to update
   }, 1000);
 }

 // Showing result innerText
 function fadeInResult(message) {


   resultElement.innerText = message;
   resultElement.style.opacity = 1;
   resultElement.style.animation = 'none'; // Disable animation for instant appearance
   void resultElement.offsetWidth; // Trigger reflow
   resultElement.style.animation = 'fadeIn 0.5s ease-in-out'; // Re-enable animation
   
 }

 // Here is all magic began
 function checkGuess() {
   const guessR = parseInt(redInput.value);
   const guessG = parseInt(greenInput.value);
   const guessB = parseInt(blueInput.value);

   if (isNaN(guessR) || isNaN(guessG) || isNaN(guessB) ||
       guessR < 0 || guessR > 255 ||
       guessG < 0 || guessG > 255 ||
       guessB < 0 || guessB > 255) {
     fadeInResult('Invalid input. Please enter valid RGB values.');
     playSound('error');
     return;
   }

   const [targetR, targetG, targetB] = targetColor
     .substring(4, targetColor.length - 1)
     .split(',')
     .map(value => parseInt(value.trim()));

   const diffR = guessR - targetR;
   const diffG = guessG - targetG;
   const diffB = guessB - targetB;

   let feedback = '';

   guessCount += 1

   if (diffR === 0 && diffG === 0 && diffB === 0) {
     const endTime = new Date().getTime();
     const elapsedTime = ((endTime - startTime) / 1000).toFixed(2);  //  minutes Note in a second is seem better
     
     status = 'correct';

     score = calculateScore(elapsedTime, guessCount);

     scoreElement.innerText = `Score: ${score}`;
     feedback = `💸 Congratulations! Correct guess in ${elapsedTime} seconds. 🎆`;

     users.push([username, score, elapsedTime])

     if (users.length > 1) {

       const maxScore = Math.max(...users.map(record => record[1]));

       const overtakeElement = document.getElementById('overtake')
       const h4Element = overtakeElement.querySelector('h4');
       const pElement = overtakeElement.querySelector('p');

       overtakeElement.style.display = 'block';

       if (score >= maxScore) {
         
         h4Element.textContent = "Congratulations!";
         pElement.textContent = "You've achieved the highest score and now stand as the new leader on the leaderboard."     

       } else {

         const previousScore = users.reduce((prev, record) => (record[1] < score && record[1] > prev) ? record[1] : prev, users[0][1]);
         const difference = (score - previousScore)* -1; // Turn Score from negative number to positive number

         h4Element.textContent = "Well Done!";
         pElement.textContent = `You were ${difference.toFixed(2)} points behind other user.`;
       } 
     }

     updateLeaderboard();

     updateTimer('correct');

     // playSound('correct'); // No Sound File yet !!

     clearScreen()

   } else {

     status = 'wrong';

     if (diffR !== 0) {
       feedback += (diffR > 0) ? `R is too high.`  : `R is too low. `;
     }
     if (diffG !== 0) {
       feedback += (diffG > 0) ? `G is too high.`  : `G is too low. `;
     }
     if (diffB !== 0) {
       feedback += (diffB > 0) ? `B is too high.`  : `B is too low. `;
     }

     // Additional hint based on warmer/colder colors
     const colorDistance = Math.sqrt(diffR**2 + diffG**2 + diffB**2);
     if (colorDistance < 100) {
       feedback += ' You are getting warmer!';
     } else {
       feedback += ' You are getting colder!';
     }
     updateTimer('wrong');
     playSound('incorrect');
   }

   fadeInResult(feedback);
   updateGuessCounter(); // Update Guess Counter
 }

 // Update Leaderboard 
 function updateLeaderboard() {
   users.sort((a, b) => b[1] - a[1]);

   leaderboardList.innerHTML = '';

   const maxUsersToShow = Math.min(users.length, 5);
   for (let i = 0; i < maxUsersToShow; i++) {
     const [name, score, time] = users[i];
     const listItem = document.createElement('li');
     listItem.textContent = `${name} - Score: ${score}, Time: ${time} seconds`;
     leaderboardList.appendChild(listItem);
   }
 }

 // Update Timer
 function updateTimer(status) {
   const timerElement = document.getElementById('timer');
   const counterElement = document.getElementById('counter');
   const now = new Date().getTime();

   if (status === 'correct') { 
     
       clearInterval(timerInterval);

   } else if (status === 'update') {
       const elapsedTime = ((now - startTime) / 1000).toFixed(0); // this variable had been used too, inside guessCheck
       timerElement.textContent = `Time: ${elapsedTime} seconds`;
   } 
   
 }

 function updateGuessCounter() {
   const counterElement = document.getElementById('counter');
   counterElement.innerText = `Guess Count: ${guessCount}`;
 }

 function offerHint() {
   if (!hintUsed) {
     const hintType = Math.floor(Math.random() * 3); // 0: R hint, 1: G hint, 2: B hint

     switch (hintType) {
       case 0:
         fadeInResult(`Hint: R is between 30 and 90`);
         playSound('hint');
         break;
       case 1:
         fadeInResult(`Hint: G is between 50 and 150`,);
         playSound('hint');
         break;
       case 2:
         fadeInResult(`Hint: B is between 100 and 200`);
         playSound('hint');
         break;
       default:
         break;
     }

     hintUsed = true;
     hintBtn.disabled = true;
   }
 }

 function revealAnswer() {
    // Extract RGB values from the target color
    const [targetR, targetG, targetB] = targetColor
        .substring(4, targetColor.length - 1)
        .split(',')
        .map(value => parseInt(value.trim()));

    // Auto-fill the input fields with the correct RGB values
    redInput.value = targetR;
    greenInput.value = targetG;
    blueInput.value = targetB;

    // Show the correct answer in the result element
    fadeInResult(`The correct answer is: R=${targetR}, G=${targetG}, B=${targetB}`);

    // Stop the timer
    clearInterval(timerInterval);
    const endTime = new Date().getTime();
    const elapsedTime = ((endTime - startTime) / 1000).toFixed(2);

    // Calculate and display the score
    score = calculateScore(elapsedTime, guessCount);
    scoreElement.innerText = `Score: ${score}`;

    // Add user score to the leaderboard
    users.push([username, score, elapsedTime]);
    
    // Play the reveal sound
    playSound('reveal');

        // Add a delay before updating the leaderboard and proceeding to the next phase
        setTimeout(() => {
            updateLeaderboard();
    
            // Proceed to the next phase: Show username input modal and start a new game
            clearScreenAndPromptUsername();
        }, 3000); // 3000 milliseconds = 3 seconds
}

 // Calculate The Score
 function calculateScore(elapsedTime, guessCount) { // Take 2 params for calculate
   // Can Adjust these factor
   const baseScore = 100;
   const timeFactor = 0.5; 
   const guessCountFactor = 5; 

   const calculatedScore = baseScore - timeFactor * elapsedTime - guessCountFactor * guessCount;

   return Math.max(calculatedScore.toFixed(2), 0);
   }

 // !! No Sound Effect file yet !!
 function playSound(soundType) {
   const audio = new Audio();
   switch (soundType) {
     case 'correct':
       audio.src = 'correct.mp3'; // Replace with the path to your correct guess sound file
       break;
     case 'incorrect':
       audio.src = 'incorrect.mp3'; // Replace with the path to your incorrect guess sound file
       break;
     case 'hint':
       audio.src = 'hint.mp3'; // Replace with the path to your hint sound file
       break;
     case 'reveal':
       audio.src = 'reveal.mp3'; // Replace with the path to your reveal answer sound file
       break;
     case 'error':
       audio.src = 'error.mp3'; // Replace with the path to your error sound file
       break;
     // Add more sound types as needed
   }
   audio.play();
 }

 function closeInstructions() {
   document.getElementById('instructionModal').style.display = 'none';
   clearScreenAndPromptUsername();
 }

 function closeUsernameBlock() {

   document.getElementById('usernameModal').style.display = 'none';

   username = document.getElementById('usernameInput').value;
 
   startGame();
 }

 function closeOvertakeBlock() {

   document.getElementById('overtake').style.display = 'none';

 }

 document.getElementById('instructionModal').style.display = 'block';