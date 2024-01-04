# Dataset format

The datasets for each army are defined in a [JSON](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/JSON) format.

## Army structure

```javascript
{
  "lords": [],
  "heroes": [],
  "core": [],
  "special": [],
  "rare": []
}
```

## Unit options

```javascript
{
  "id": String, // Unique ID, example: "ork-whaaaghboss"
  "name_de": String, // German name
  "name_en": String, // English name
  "named": Boolean, // For a unique, named character like Grimgor
  "points": Number, // Points for each model
  "minimum": Number, // Minimum number of models of the unit
  "maximum": Number, // Maximum number of models of the unit
  "command": [ // A list of all command options
    {
      "name_de": String,
      "name_de": String,
      "points": Number,
      "magic": {
        "types": [ // Limit the available magic items (see "magic-items.json" types)
          String
        ],
        "maxPoints": Number // Maximum points for magic items
      }
    }
  ],
  "equipment": [ // All equipment options, they are mutually exclusive
    {
      "name_de": String,
      "name_de": String,
      "points": Number,
      "perModel": Boolean, // Wether the points are counted per model
      "active": Boolean // Wether it should be selected by default
    }
  ],
  "options": [ // All options, they are NOT mutually exclusive
    {
      "name_de": String,
      "name_de": String,
      "points": Number,
      "stackable": Boolean, // Allows multiple selectins of this option
      "minimum": Number, // Minimum number of this option
      "maximum": Number, // Maximum number of this option
    }
  ],
  "mounts": [ // All mount options, they are mutually exclusive
    {
      "name_de": String,
      "name_de": String,
      "points": Number,
      "active": Boolean, // Wether it should be selected by default
    }
  ],
  "magic": { // Magic items are defined in the "magic-items.json" file
    "types": [ // Limit the available magic items (see "magic-items.json" types)
      String
    ],
    "maxPoints": Number // Maximum points for magic items
  }
}
```

## Example

[Greenskins dataset](https://github.com/nthiebes/old-world-builder/blob/main/public/games/warhammer-fantasy/greenskins.json)
