# Main File Structure
```json
{
  "Variables": {
    /* 
    Set up your variables here
    Supported types are string and number
    Please do not mix them as you might break the bot
    */
  },
  "Description": "", // Describe your Story here
  "Frames": { 
    /*
    A frame is basically one message that the bot sends.
    Dialog is the text show in it, options are what the player chooses to progress 
    */
    "index": { // Stories always begin with a frame 'index'
      "dialog": {
        "title": "Title", // The title of the text
        "text": "Lorem ipsum" // The actual text show in the box
      },
      "options": [
        {
          "next": "prologue", // The frame the player will advance to after picking it
          "text": "Start", // The text that shows next to the option indicator
          "qualify": [ // All conditions must be met in order for the option to show up. Have at least one option get to show up 100% of the time or it could cause some strange effects.
            {
              "var": "test", // Name of the variable to be checked
              "value": 5, // Value can be a string or a number. If checking for strings, only exact matches are available
              "check": "greater" // ... "lesser" or "equal" - Type of check
            }
            // ...
          ],
          "varchanges": [ // Makes changes to some variables after picking the option
            {
              "var": "test", // Name of the variable to change
              "value": 2, // Can be a string or a number.
              "type": "add" // ... or "set" - Strings only support 'set'
            }
            // ...
          ]
        },
        // ... (Up to 10)
      ]
    },
    // ...
    "end": { // An End Frame has no options. It does not have to be strictly called 'end' as any Frame without options will be considered an End Frame
      "dialog": {
        "title": "End!",
        "text": "This is the end of my story."
      }
    }
  }
}
```