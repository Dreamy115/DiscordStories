# DiscordStories
Stories is a tool for storytelling via discord. It works by using message reactions to see which options the user picks along the way, and reacts accordingly, switching to the next requested frame. By itself it does **not** come with any stories other than a sample.

## Story File Structure
By default, the bot seeks a *.story.json* file. But it supports much more user-friendly YAML *.story.y(a)ml* to create stories too if a *.story.json* file with the same name isn't found first.

```yaml
---
# You declare all your variables in a Variables object first.
Variables:
  - test: 4 # Variables currently only support *string* and *number*
Description: Use this to describe what your Story is about.
Frames: 
  # This is the main and biggest part of the entire file. It's where all the frames are stored.
  index: # All Stories begin with an *index* Frame
    dialog: # the Dialog is the actual message the Discord bot will send
      title: Title of the Dialog
      text: |-
        Body of the Dialog. For both of them see official discord documentation for character limits.
        You can also show a variable with a placeholder; test = {test}
    options: # Omit *options* entirely if you want to make an EndFrame
      # This is the most fun part. An Option is a user's choice. There can be only one, or multiple. They advance to other Frames.
      # They even have conditions and variable changes, but to that in a sec.
      - next: index2 # A *next* points to the frame the Story will advance after picking this option.
        text: Pick Me! # It's the text that shows next to the option indicator.
        gray: false # If true, if a user doesn't pass the qualify checks of an option, it will display anyway, but be locked. It false, it will be hidden completly.
        qualify:
          # *qualify* is an array of checks that have to be passed in order for the Option to be pickable.
          - var: test # The variable's name you want to check. There can be only one per qualify element, but you can have multiple.
            value: 4 # Value to check against.
            check: greater 
            # *check* says what type of check to perform.
            # numbers support 'greater', 'lesser', 'equal' and 'not'.
            # strings only support 'equal' and 'not'. Beware that they're case sensitive.
         #- ... You can have more checks here if you want.
        varchanges:
          # Varchanges tell the Story how to change it's variables after picking an option.
          - var: test # Name of the variable to change.
            value: 2 # The value to change it with.
            type: add # What to do with it. Numbers support 'add' and 'set' whereas strings support only 'set'. Note on subtraction, just add a negative value.
         #- ... Of course, you can have multiple variables changed in one option.
...
```
Same goes for JSON, just in a different format. You should use YAML anyway.

A story automatically ends when it lands on a frame without an **options** array.
Notice there aren't any paths, or nested frames. Everything is at the same level, only guided by an Option's *next* value.