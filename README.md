

# Hourglass Code Risk Analyzer

Hourglass Code Risk Analyzer is a CI/CD tools as a github action that
analyzes your source files to determine which files have the highest
risk of potential defects.  It uses the past 300 commits of your github repository and gets source code statitics per commit, and then uses a proprietory formula to calcuate the risk score per file.  Data for each file per commit is used to calculate a risk score such as:

1. number of commits in past 7 days
2. number of lines of code changes in past 7 days
3. number of commits in past 30 days
4. number of lines of code changes in past 30 days
5. number of commits total
6. number of lines of code changes total
7. commit message contains words that are scored (ie: fix, bug, etc)
8. number of unique users that committed in past 7 days
9. number of unique users that committed in past 30 days
10. number of unique users that committed total

The higher the score, the riskier it can contain defects.
The calculation also normalizes values.

## Usage

Simply enable this tool as an action in your github repository.  The full list of results will be printed to the console log.  Based on the results, you can assign resources to test specific areas of your code, or invest more time reviewing changes per risk file to ensure no defects exist.

The action requires the repo name, user, and github api token as inputs to execute.

### Workflow

    name: 'code-risk-analyzer'

    on:
      push: {branches: main}
      pull_request: {branches: main}

    jobs:
      code-risk-analyzer:
        # Name the Job
        name: Code Risk Analyzer
        # Set the type of machine to run on
        runs-on: ubuntu-latest

        steps:
          # Checks out a copy of your repository on the ubuntu-latest machine
          - name: Checkout code
            uses: actions/checkout@v2

          - name: Run Code Risk Analyzer
            uses: Fizz-Q/code-risk-analyzer@v1.22
            with:
              # ${{ github.repository }}
              repository: ${{ github.repository }}
              # ${{ github.repository_owner }}
              user: ${{ github.repository_owner }}
              # ${{ secrets.GITHUB_TOKEN }}
              github_token: ${{ secrets.GITHUB_TOKEN }}

## Example Output
analyzing... <br />
Analysis Complete.  Results and risk scores for source files from highest to lowest risk: <br />
SOURCE FILE: src/com/hourglasssoftware/bugpredictor/JiraManager.java  RISK SCORE:2.806338028169014 <br />
SOURCE FILE: src/com/hourglasssoftware/bugpredictor/runner/HourglassBugPredictor.java  RISK SCORE:2.4836747759282973<br />
SOURCE FILE: src/com/hourglasssoftware/bugpredictor/DataManager.java  RISK SCORE:2.422215108834827<br />
SOURCE FILE: src/com/hourglasssoftware/bugpredictor/BugPredictor.java  RISK SCORE:2.2877720870678617<br />
