# Scrolling Test Tool

This scrolling test was developed by Chaoran Chen and Brad Myers for the CMU HCII class [05-440/640: Interaction Techniques]("https://www.cs.cmu.edu/~bam/uicourse/05440inter2022/"), Spring, 2022. The DESIGN for the tools and the software implements were contributed by Brad Myers, Carnegie Mellon University, and based on a class project by Cem Ergin, Emily Porat, Sijia Li, and Chun Wang. 

The goal is to explore creating a standardized test for scrolling, that will work on any device that can view a webpage. The key requirement was to avoid the need to click, as required by all other scrolling tests, since for some tasks like reading, no clicking is needed when scrolling. Also we found that the difficulty of clicking accurately was dominating the times on smartphones, so it wasn't really testing the scrolling speed.

There are 2 phases of tests - in one, which models scrolling to an unknown place, so the user must do a visual search while scrolling, the goal is to land the stars or certain line into the grey area as QUICKLY and as ACCURATELY as possible. In the second phase, which models going to a known place, the user is told which line to scroll to. In each phase, the user must scroll various lengths, ranging from a few lines to all the way to the end of the page, which is about 99 rows of graphics, where each row is about the size of 3 lines of text (so the document is about 300 lines of text tall).

At the end of the test, the current code puts all the results into our [Google Sheet](https://docs.google.com/spreadsheets/d/1IFnbDxDevUu4e9yBf4bvp2ftLrxqFBydhNRS9CWxw6M/edit?usp=sharing).

You are welcome to use this test as-is, and check the results in our Google Sheet, or else to adapt it as desired to your needs. We hope to eventually have a publication about this test, but for now, please cite us as:

Chaoran Chen and Brad A Myers, "Scrolling Test Software", 2022, https://github.com/CharlieCRChen/scrolling-test-new/ 


## How to use it

1. Install this tool to your server.
2. Set up a Google Sheet ready for access
3. Create a new App Script in your sheet

### Install this tool
First, you can use git clone or download it as a zip file and unzip it in your server.

### Set up your own google sheet
In your own Google Sheet, enter the column name of your data 
```
ParticipantID, Scrolling_Technique, Level_of_Experience, Mode, Autoswitch, IP, Round, Time (ms), Target_Line, Num_Switchbacks, Cumulative_Distance_(px), Max_Back_Track_Distance_(px), Ratio, Date
```
and then make it public by following the publishing steps below:

1. Click File > Publish to the web
2. Select the 'Link' tab
3. Choose either 'Entire Document' or (more likely) a specific sheet name
4. In the next drop down, choose 'Web page'.
5. Expand the section at the bottom
6. Check the box next to 'Automatically republish when changes are made'
7. Click 'Publish'

Next, you'll need to make the sheet available to anyone with the link (**in read-only mode**):

1. In the top right of the screen, hit the 'Share' button
2. Change the dropdown option to 'Anyone with the link'
3. Make sure to leave the right hand drop down on 'Viewer', this way your sheet will remain read-only to the internet
4. Hit 'Done'

And that's all the Sheet setup work done!

### Create a new App Script in your sheet
In your google sheet, your should create a App Script to allow it receive the data from this tool by following the steps below:

1. Click Extension > App Script
2. Paste the following code to your new script. **Remember to replace the url and sheet variables in the code with yours**.
```
var url = SpreadsheetApp.openByUrl("CHANGE TO YOUR GOOGLE SHEET URL");
var sheet = url.getSheetByName('YOUR SHEET NAME');

function doPost (e){
  var action = e.parameter.action;
  if (action=="addData"){
    return addData(e);
  }
}

function addData (e) {
  var data = JSON.parse(e.postData.contents);
  data4sheet1 = data;
  for (var i=0; i<data4sheet1.length; i++){
    sheet.appendRow([data4sheet1[i]["ParticipantID"], 
                    data4sheet1[i]["Scrolling_Technique"], 
                    data4sheet1[i]["Level_of_Experience"],data4sheet1[i]["Mode"],
                    data4sheet1[i]["Autoswitch"], 
                    data4sheet1[i]["IP"], 
                    data4sheet1[i]["Round"],data[i]["Time_(ms)"],data4sheet1[i]["Target_Line"],
                    data4sheet1[i]["Num_Switchbacks"],data4sheet1[i]["Cumulative_Distance_(px)"],
                    data4sheet1[i]["Max_Back_Track_Distance_(px)"],
                    data4sheet1[i]["Ratio"],
                    data4sheet1[i]["Date"]
                  ]);
  }
  return ContentService.createTextOutput("SUCCESS").setMimeType(ContentService.MimeType.TEXT);
}
```
3. Then, click the "Save" icon, or click "File", then choose "Save".
4. Click "Run", then choose "setup". 
5. A dialog of "Authorization required" pops up. Click "Review Permissions". Click "Allow" in the next dialog.
6. Click "Publish", then choose "Deploy as web app...".
7. In the popup, choose "New" in "Project version:", then type something about this version in the text box below it. For "Execute the app as:", choose "Me". For "Who has access to the app:", choose "Anyone, even anonymous". Then Click "deploy".
8. Copy the "Current web app URL", e.g. like https://script.google.com/macros/s/SOME_LONG_KEY_HERE/exec
9. Paste the URL to the variable `scriptURL` in the function `sendData2GoogleSheet` in `main.js`. Add `?action=addData` at the end of the URL. It should be like 
```
const scriptURL = "https://script.google.com/macros/s/SOME_LONG_KEY_HERE/exec?action=addData"
```

