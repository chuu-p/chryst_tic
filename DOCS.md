# blue.moon

- visual novel / management game

VA-Hall-A inspired
With factorio 



Workspaces like I 3at the bottom 
Switch with l and r buttons 
Have a little. Notification when something is ready


Crafting screen like factorio inventory

Factorio crafting 
10 Hemp. Plants - > craft into buds, seeds, stems, etc
Seeds craft into oil
Etc

Factorio researching of new products and strains and stuff 


Agentic employees 
Employees have a state like working, idle, etc 
You can give them tasks that they do 
Like always craft hemp plant to buds and stuff 
Then they wait for the task and then do it

Strains can be semi. Realistic like combining indica and sativa to create sour diesel etc 

---
Crafting, Items and Research

The player can do one action at a time. An action is a process with a certain duration.

Example: Select (Hemp Plant) - Process > 4 Buds + 4 Seeds + 2 Trim
This takes 5-10 seconds, and the player can schedule, but not work on other tasks at this time.

Actions:
- process (item) -> takes the item and time
- research (technology) -> takes items and time

buying and selling items is instant
1 sec 1 day

screens:
- farming
- breeding
- processing
- selling
- researching

technologies:
- farming
    - bokashi - player can use buds, seeds and trim to make fertilizer (recycling mechanic)
        - crop rotation - during off season, plant non-help crops like legumes for nitrogen-fixing, enriches the soil and controls pests
        - living soil
        - topping / low stress training
        - plant supports like bamboo or rope frames
    - sexing plants: The ability to reliably identify and remove male plants
    - (late game) greenhouse
- genetics
    - unlock selective breeding
        - (infinite research) cross X with Y to get Z
    - clones / mother plant (does not need seeds for new plants anymore, no randomness)
    - (late game) F1 hybrids / inbreeding
- processing
    - drying in the barn
        - curing sheds
        - ceramic curing vessels
    - hand rolled temple ball hash / charas (can be aged)
        - dry sift pollen
        - lebanese - kief pressed (needs press)
    - (late game) ice water seperation
    - (late game) rosin
- marketing / selling
    - farmhouse store
        - temple market stall
        - edo market stall
    - better packaging
    - reputation scrolls
    - daimyo contracts
    - brand mark (mon)
    - order distribution network

item types:
- seed/seedling (strainish, plantish, breedable, sellable)
    - strainish
        - strain name
        - indica/sativa: -1 to 1
    - plantish
        - robustness: 0 to 1
        - yield: 0 to 1
        - quality: 0 to 1
        - potency_potential: 0 to 1
    - sellable
        - price: 0 to 10000
- crop (strainish, potencyish, plantish, harvestable)
  - strainish
    - strain
      - strain name
      - indica/sativa: -1 to 1
    - potencyish
      - thc: 0 to 100 percent
      - cbd: 0 to 100 percent
      - terps: one of Enum.Terpenes
    - plantish
      - robustness: 0 to 1
      - yield: 0 to 1
      - quality: 0 to 1
      - potency_potential: 0 to 1
    - harvestable
      - harvest_time: 0 to 100 days
      - harvest_quality: 0 to 1
      - harvest_potency: 0 to 1
      - harvest_weight: 1 to 500g
- harvested plant (strainish, potencyish, processable, dryable)
    - strainish
        - strain name
        - indica/sativa: -1 to 1
    - potencyish
        - thc: 0 to 100 percent
        - cbd: 0 to 100 percent
        - terps: one of Enum.Terpenes
    - spoilable
        - dryness -1 to 1 (-1 too wet, 0 perfect, 1 too dry) 
    - processable (gets processed into x buds, y trim, z seeds)
        - bud_conversion: 0 to 90 percent buds of plant weight
        - trim_conversion: 10 to 100 percent trim of plant weight
        - seed_rate: 0 to 100 percent of 1g buds contain a seed
- fertilizer (applyable, sellable)
    - applyable
        - apply on plant to increase yield (only X times per plant per season)
    - sellable
        - base price (actual price is higher/lower based on demand)
- trim (potencyish, recycleable, sellable)
    - recycleable
        - gets recycled into x fertilizer
    - extractable
        - gets extracted into x hash
    - sellable
        - base price (actual price is higher/lower based on demand)
- 1g bud/hash/rosin (strainish, potencyish, spoilable, sellable, pureish)
    - strainish
        - strain name
        - indica/sativa: -1 to 1
    - potencyish
        - thc: 0 to 100 percent
        - cbd: 0 to 100 percent
        - terps: one of Enum.Terpenes
    - spoilable
        - freshness: 0 to 100 (0 spoiled, 100 perfect)
        - spoil rate: 0-100 lost freshness per day
    - sellable
        - base price (actual price is higher/lower based on demand)
    - pureish
        - purity: 0 to 100 how much plant matter is in the product
- (item) stack
    - item: item (has an average of all items, will get duplicated when an item gets removed from the stack)
    - amount: int


items:
- (strain) seed
- (strain) seedling
- (strain) crop (growing plant)
- (strain) produce (harvested plant)
- fertilizer
- trim
- (strain) charas / temple balls
- (strain) bud
- (strain) dry sift / pollen
- (strain) hash
- (strain) ice water hash
- (strain) rosin


strain tree:
- ruderalis japan
- sativa japan
- sativa thai 
- indica indian 
- indica european 

- northern lights
    - afghani
        - kush indica
            - indica indian
            - ruderalis japan
        - indica european
    - hawaiian
        - super sativa japan
            - sativa thai
            - sativa japan
        - sativa thai

employees:
- aiko (farm girl, specialty: farming)
- hana (botany, specialty: breeding)
- yuki (tgirl, specialty: marketing)
- ayane (engineer girl, specialty: processing)
- ren (autistic girl, specialty: researching)

action queue:
- Allow the player to browse the Market or Research tabs to plan their _next_ move while another task is processing


somday features:
- **Mini-Game:** For high-value tasks (like making Temple Balls), add a simple button-timing mini-game during the duration. If they succeed, the `Quality` or `Yield` increases.

---

# TODO:

- implement this first without a UI as just a console game in vanilla python in the console and then port it to tic-80

#### C. The UI Real Estate (Screen Space)

**The Problem:** TIC-80 has a 240x136 resolution. Displaying: _Strain Name, Indica/Sativa ratio, THC%, CBD%, Terpene, Weight, Freshness, and Price_ for every item in a list is impossible in text form. **The Fix: Glyphs and Color Coding.**

- **Strain:** Don't write "Northern Lights". Use a generated 2-letter code "NL" or a unique icon color.
    
- **Stats:** Use visual bars (rectangles) for Freshness and Potency rather than numbers.
    
- **Terpenes:** Use a colored pixel dot (e.g., Yellow = Limonene/Citrus, Purple = Linalool/Floral).
    


---

One Screen

BG (with Portrait) | Inventory 16x16 Grid
+++++++++++++++++++++++++++++++
Dialogue Box | Settings/Load/X/Exit Menu

People come in and Talk with you and want to buy stuff
They tell you: This is my problem / This is what I want, please sell it to me

---

You are the store owner and manager of the company.


---

- factorio slot / inventory / spoilage mechanic

you are the manager of a company in edo japan. the "skill" is making the right decisions and hiring the right people

Season 1: just plant, harvest and sell the buds, seeds, stems and leaves directly
- from the profits, hire a helper
Season 2: 
- with your helper: optimize the planting, harvesting process
- sell the buds, seeds, stems and leaves directly
- we will have a lot of surplus bud material, which needs to be processed so that it is shelf stable for the winter and can be sold all year
Season 3:
- marketing/PR introduced
- we have too much product, the warehouse gets fuller and fuller, we need PR and marketing


Decisions
- in season
- which strains / seeds to plant
- when to seed / create hatchlings
- when to plant outside
- how much / what to fertilize
- when to harvest
- where/how long to dry
- store now / process further
- processing
    - making


each product has a certain demand based on
- marketing
- availability
- quality

the products get sold in stores
1. farmhouse store
    - customers have to go to the farmhouse to purchase the products
    - mostly local customers
    - relatively stable demand
2. yearly / bi-yearly market in Edo City
    - the player and their helpers ride a cart to edo and sell their products there
    - when the quality is good, it generates a hype and the demand spikes
3. 

---

Screens

- Farm (Planting, Growing, Harvesting)
    - Season
    - Grid
        - Plant 1, 2, 3 ,4
        - Plant 1, 2, 3 ,4
        - Plant 1, 2, 3 ,4
- Workshop (Processing)
    - Trimming
    - Split Grid
- Warehouse / Barn (Storage / drying / curing)
    - Overview of which product with which freshness
    - Grid
        - Product 1, 2, 3, 4
        - Product 1, 2, 3, 4
        - Product 1, 2, 3, 4
        - Product 1, 2, 3, 4
    - Each Product
        - Image of the type of product
        - At the bottom: bar with red to green gradient, that shows, how fresh the product still is
        - If product is selected:
            - Show popup
            - Quantity, Quality, How much it is worth, type of product
- Farmhouse Store
    - Which products are on display
    - orders that come in can be processed here
- Cart preparing screen
    - which products to load onto the cart
- Market stall screen
    - Which products are on display
    - orders that come in can be processed here

On every screen, a speech bubble of a character can appear. The Player can then choose to press y to talk to them, and then a dialogue screen appears


---

tech
- store bg images as python variables - compressed, then uncompress and draw to image buffer directly
