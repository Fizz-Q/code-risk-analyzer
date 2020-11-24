/**
 * http://usejsdoc.org/
 */

var GitHub = require('github-api');
var Repository =  require('github-api/dist/components/Repository');
const core =  require('@actions/core');
const github = require('@actions/github');

class FileStatistics{

   constructor(){
      this.filename = '';
      this.numCommitsSevenDays = 0;
      this.numChangesSevenDays = 0;
      this.numCommitsThirtyDays = 0;
      this.numChangesThirtyDays = 0;
      this.numCommitsTotal = 0;
      this.numChangesTotal = 0;
      this.messagesScores = [];
      this.numUsersCommitsSevenDays = 0;
      this.numUsersCommitsThirtyDays = 0;
      this.numUsersCommitsTotal = 0;
      this.usersCommitsSevenDays = [];
      this.usersCommitsThirtyDays = [];
      this.usersCommitsTotal = [];
      this.score =0;
   }
}

var files = [];
var commitsList = [];

const repository = core.getInput('repository');
const user = core.getInput('user');
const token = process.env['GITHUB_TOKEN'];

var repo = new Repository(repository,{
   username: user,
   token: token
}, 'https://api.github.com');

repo.listCommits({per_page: 300},function(err, commits){
   for(var x=0; x < commits.length; x++){
      commitsList.push(commits[x].sha);

   }
   processCommits();
   
});

async function processCommits() {
   console.log("analyzing...");
   for(var x=0; x< commitsList.length; x++){
      await repo.getSingleCommit(commitsList[x],function(err, commit){
         for(var y=0; y < commit.files.length; y++){
            if(doesContainFile(commit.files[y].filename)){
               var fileIndex = getFileIndex(commit.files[y].filename);
               files[fileIndex].usersCommitsTotal.push(commit.commit.author.name);
               files[fileIndex].numCommitsTotal++;
               files[fileIndex].numChangesTotal+=commit.files[y].changes;
               var currentDate = new Date().toISOString().slice(0, 10);
               var currentYear = currentDate.split('-')[0];
               var currentMonth = currentDate.split('-')[1];
               var currentDay = currentDate.split('-')[2];
               var commitDate = commit.commit.author.date.split('T')[0];
               var commitDateYear = commitDate.split('-')[0];
               var commitDateMonth = commitDate.split('-')[1];
               var commitDateDay = commitDate.split('-')[2];
               var numDaysNow = (currentYear *365)+(currentMonth*30)+(currentDay);
               var numDaysCommit = (commitDateYear *365)+(commitDateMonth*30)+(commitDateDay);
               if(numDaysNow - numDaysCommit <= 7) {
                  files[fileIndex].numCommitsSevenDays++;
                  files[fileIndex].numChangesSevenDays+=commit.files[y].changes;
                  files[fileIndex].usersCommitsSevenDays.push(commit.commit.author.name);
               }
               if(numDaysNow - numDaysCommit <= 30) {
                  files[fileIndex].numCommitsThirtyDays++;
                  files[fileIndex].numChangesThirtyDays+=commit.files[y].changes;
                  files[fileIndex].usersCommitsThirtyDays.push(commit.commit.author.name);
               }
               if(commit.commit.message.includes('bug') || commit.commit.message.includes('fix') || commit.commit.message.includes('defect')){
                  files[fileIndex].messagesScores.push(4);
               }
               else if(commit.commit.message.includes('update') || commit.commit.message.includes('modify') || commit.commit.message.includes('change') || commit.commit.message.includes('test')){
                  files[fileIndex].messagesScores.push(3);
               }
               else if(commit.commit.message.includes('add') || commit.commit.message.includes('remove')){
                  files[fileIndex].messagesScores.push(2);
               }
               else {
                  files[fileIndex].messagesScores.push(1);
               }
            }
            else{
               var fileStats = new FileStatistics();
               fileStats.filename = commit.files[y].filename;
               fileStats.usersCommitsTotal.push(commit.commit.author.name);
               fileStats.numCommitsTotal++;
               fileStats.numChangesTotal+=commit.files[y].changes;
               var currentDate = new Date().toISOString().slice(0, 10);
               var currentYear = currentDate.split('-')[0];
               var currentMonth = currentDate.split('-')[1];
               var currentDay = currentDate.split('-')[2];
               var commitDate = commit.commit.author.date.split('T')[0];
               var commitDateYear = commitDate.split('-')[0];
               var commitDateMonth = commitDate.split('-')[1];
               var commitDateDay = commitDate.split('-')[2];
               var numDaysNow = (currentYear *365)+(currentMonth*30)+(currentDay);
               var numDaysCommit = (commitDateYear *365)+(commitDateMonth*30)+(commitDateDay);
               if(numDaysNow - numDaysCommit <= 7) {
                  fileStats.numCommitsSevenDays++;
                  fileStats.numChangesSevenDays+=commit.files[y].changes;
                  fileStats.usersCommitsSevenDays.push(commit.commit.author.name);
               }
               if(numDaysNow - numDaysCommit <= 30) {
                  fileStats.numCommitsThirtyDays++;
                  fileStats.numChangesThirtyDays+=commit.files[y].changes;
                  fileStats.usersCommitsThirtyDays.push(commit.commit.author.name);
               }
               if(commit.commit.message.includes('bug') || commit.commit.message.includes('fix') || commit.commit.message.includes('defect')){
                  fileStats.messagesScores.push(4);
               }
               else if(commit.commit.message.includes('update') || commit.commit.message.includes('modify') || commit.commit.message.includes('change') || commit.commit.message.includes('test')){
                  fileStats.messagesScores.push(3);
               }
               else if(commit.commit.message.includes('add') || commit.commit.message.includes('remove')){
                  fileStats.messagesScores.push(2);
               }
               else {
                  fileStats.messagesScores.push(1);
               }

               if(fileStats.filename !== 'README.md'){
                  files.push(fileStats);
               }
            }
         }
      });
   }

   await processUsers();
   await calcScore();
   await result();
}

function doesContainFile(filename){
   for(var x=0; x< files.length; x++){
      if(files[x].filename === filename){
         return true;
      }
   }
   return false;
}

function getFileIndex(filename){
   for(var x=0; x< files.length; x++){
      if(files[x].filename === filename){
         return x;
      }
   }
   return undefined;
}

async function processUsers(){
   let sevenDaySet = new Set();
   let thirtyDaySet = new Set();
   let totalSet = new Set();
   for(var x=0; x< files.length; x++){
      sevenDaySet.add(files[x].usersCommitsSevenDays[0]);
      files[x].numUsersCommitsSevenDays++;
      thirtyDaySet.add(files[x].usersCommitsThirtyDays[0]);
      files[x].numUsersCommitsThirtyDays++;
      totalSet.add(files[x].usersCommitsTotal[0]);
      files[x].numUsersCommitsTotal++;
      for(var y=1; y< files[x].usersCommitsSevenDays.length; y++){
         if(!sevenDaySet.has(files[x].usersCommitsSevenDays[y])){
            files[x].numUsersCommitsSevenDays++;
            sevenDaySet.add(files[x].usersCommitsSevenDays[y]);
         }
      }
      for(var y2=1; y2< files[x].usersCommitsThirtyDays.length; y2++){
         if(!thirtyDaySet.has(files[x].usersCommitsThirtyDays[y2])){
            files[x].numUsersCommitsThirtyDays++;
            thirtyDaySet.add(files[x].usersCommitsThirtyDays[y2]);
         }
      }
      for(var y3=1; y3< files[x].usersCommitsTotal.length; y3++){
         if(!totalSet.has(files[x].usersCommitsTotal[y3])){
            files[x].numUsersCommitsTotal++;
            totalSet.add(files[x].usersCommitsTotal[y3]);
         }
      }
   }
}

async function calcScore(){

   var totalnumCommitsSevenDays = 0;
   var totalnumChangesSevenDays = 0;
   var totalnumCommitsThirtyDays = 0;
   var totalnumChangesThirtyDays = 0;
   var totalnumCommitsTotal = 0;
   var totalnumChangesTotal = 0;
   var totalnumUsersCommitsSevenDays = 0;
   var totalnumUsersCommitsThirtyDays = 0;
   var totalnumUsersCommitsTotal =0;

   for(var x=0; x< files.length; x++){
      totalnumCommitsSevenDays += files[x].numCommitsSevenDays;
      totalnumChangesSevenDays += files[x].numChangesSevenDays;
      totalnumCommitsThirtyDays += files[x].numCommitsThirtyDays;
      totalnumChangesThirtyDays += files[x].numChangesThirtyDays;
      totalnumCommitsTotal += files[x].numCommitsTotal;
      totalnumChangesTotal += files[x].numChangesTotal;
      totalnumUsersCommitsSevenDays += files[x].numUsersCommitsSevenDays;
      totalnumUsersCommitsThirtyDays += files[x].numUsersCommitsThirtyDays;
      totalnumUsersCommitsTotal += files[x].numUsersCommitsTotal;
   }

   for(var y=0; y< files.length; y++){
      var score = files[y].numCommitsSevenDays/totalnumCommitsSevenDays +
      files[y].numChangesSevenDays/totalnumChangesSevenDays + 
      files[y].numCommitsThirtyDays/totalnumCommitsThirtyDays +
      files[y].numChangesThirtyDays/totalnumChangesThirtyDays +
      files[y].numCommitsTotal/totalnumCommitsTotal +
      files[y].numChangesTotal/totalnumChangesTotal +
      files[y].numUsersCommitsSevenDays/totalnumUsersCommitsSevenDays +
      files[y].numUsersCommitsThirtyDays/totalnumUsersCommitsThirtyDays +
      files[y].numUsersCommitsTotal/totalnumUsersCommitsTotal;

      var totalMsgScore = 0;
      for(var z=0; z< files[y].messagesScores.length; z++){
         totalMsgScore+=files[y].messagesScores[z];
      }
      var avgMsgScore = totalMsgScore/(4*files[y].messagesScores.length);
      score += avgMsgScore;
      files[y].score = score;
   }

}

async function result(){
   files.sort(compare);
   for(var x=0; x< files.length; x++){
      console.log("SOURCE FILE: "+files[x].filename+"  RISK SCORE:"+files[x].score);
   }
}

function compare(a, b) {

   const scoreA = a.score;
   const scoreB = b.score;
 
   let comparison = 0;
   if (scoreA < scoreB) {
     comparison = 1;
   } else if (scoreA > scoreB) {
     comparison = -1;
   }
   return comparison;
 }