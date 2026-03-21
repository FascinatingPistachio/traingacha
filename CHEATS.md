# Rail Gacha — Console Cheats

Open browser DevTools (F12) → Console tab.
The `rg` object is available as soon as the page loads.
Type `rg.help()` to see all commands.

## Commands

| Command                 | What it does                                      |
|-------------------------|---------------------------------------------------|
| `rg.thomas()`           | Force next pack to include a Thomas character     |
| `rg.legendary()`        | Force next pack to be all Legendaries             |
| `rg.epic()`             | Force next pack to be all Epics                   |
| `rg.tickets(500)`       | Add 500 tickets (pass any number)                 |
| `rg.maxtickets()`       | Set tickets to 999,999                            |
| `rg.daily()`            | Reset daily bonus so you can claim again now      |
| `rg.pity(49)`           | Set pity counter (49 = near-guaranteed Legendary) |
| `rg.clearads()`         | Reset ad cooldown                                 |
| `rg.clearcollection()`  | Wipe collection, keep tickets                     |
| `rg.save()`             | Print current save state as a table               |
| `rg.reset()`            | Wipe everything and start fresh                   |
| `rg.help()`             | Print this list in the console                    |

All commands that modify save data reload the page automatically after ~600ms.
Pack cheat flags (`thomas`, `legendary`, `epic`) are cleared after one pack open.
