# Adding checks for restrictions on options
Many units have options with restrictions on how many units in an army may take them. For example, only one unit of Orc Boys can have Big 'Uns, and only one per 1000 points can have Frenzy.

Restricted options must have a unique `id` parameter. This is used to find other instances of the same option on other units. If multiple units share the same restriction, for example "0-1 units of Jade Warriors or 0-1 unit of Jade Lancers can be upgraded", make sure the option has the same `id` for both units.

### 1 per army
"0-1 unit in your army may have the Big 'Uns special rule."
```
{
  "id": "orc-mob-big-uns",
  "name_en": "Big 'Uns",
  "points": 2,
  "perModel": true,
  "notes": {
    "name_en": "0-1 per army"
  },
  "restrictions": {
    "max": 1
  }
}
```

### Up to 1 per 1000 points
"0-1 unit per 1,000 points may have the Frenzy special rule."
```
{
  "id": "orc-mob-frenzy",
  "name_en": "Frenzy",
  "points": 1,
  "perModel": true,
  "notes": {
    "name_en": "0-1 per 1000 points"
  },
  "restrictions": {
    "max": 1,
    "points": 1000
  }
}
```

### Command magic items per 1000 points
"0-1 unit per 1,000 points may purchase a magic standard worth up to 50 points."
```
{
  "id": "orc-mob-standard-bearer",
  "name_en": "Standard bearer",
  "points": 5,
  "magic": {
    "types": ["banner"],
    "maxPoints": 50
  },
  "notes": {
    "name_en": "0-1 unit per 1000 points may purchase a magic standard",
  },
  "restrictions": {
    "subOption": "magic",
    "max": 1,
    "points": 1000
  }
}
```

### Requires a character
"0-1 unit in the same muster list as Kiknik may have the Ambushers special rule for free."
```
{
  "id": "wolf-rider-kiknik-ambushers",
  "name_en": "Ambushers",
  "points": 0,
  "perModel": true,
  "notes": {
    "name_en": "0-1 Goblin Wolf Rider Mob if Kiknik is in the army",
  },
  "restrictions": {
    "requires": {
      "unitIds": ["kiknik-toofsnatcha"],
      "type": "characters"
    },
    "max": 1
  }
}
```

### Requires a character with a specific option per choice
"For each character in your army that has the Renegade Knight Infamous Origin, 0-1 unit of Freeblade Knights or Veteran Freeblade Knights may have the Lance Formation and the Noble Disdain special rules for +2 points."
```
{
  "id": "freeblade-lance-noble-disdain",
  "name_en": "Lance Formation, Noble Disdain",
  "points": 2,
  "perModel": true,
  "notes": {
    "name_en": "0-1 unit for each character with the Renegade Knight Infamous Origin",
  },
  "restrictions": {
    "requires": {
      "unitIds": ["renegade-prince", "renegade-captain", "outcast-wizard"],
      "option": "renegade-knight",
      "optionType": "command",
      "perUnit": true,
      "type": "characters"
    },
    "max": 1
  }
}
```
