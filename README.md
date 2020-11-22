

# Hourglass Code Risk Analyzer

Hourglass Code Risk Analyzer is a CI/CD tools as a github action that
anallyzes your source files to determine which files have the highest
risk of potential defects.  It uses the past 300 commits of your github repository and gets source code statitics per commit, and then uses a proprietory formula to calcuate the risk score per file.  Data for each file per commit is used (such as change frequency, change amount, number of users contributing to each file, and many more statitics) to calculate a risk score.

## Usage

Simply enable this tool as an action in your github repository.  The full list of results will be printed to the console log.  Based on the results, you can assign resources to test specific areas of your code, or invest more time reviewing changes per risk file to ensure no defects exist.

The action requires the repo name, user, and github api token as inputs to execute.

