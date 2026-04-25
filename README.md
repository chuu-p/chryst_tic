~~~
                                                   .x+=:.        s    
            .uef^"                   ..           z`    ^%      :8    
          :d88E          .u    .    @L               .   <k    .88    
      .   `888E        .d88B :@8c  9888i   .dL     .@8Ned8"   :888ooo 
 .udR88N   888E .z8k  ="8888f8888r `Y888k:*888.  .@^%8888"  -*8888888 
<888'888k  888E~?888L   4888>'88"    888E  888I x88:  `\8b.   8888    
9888 'Y"   888E  888E   4888> '      888E  888I 8888N=*8888   8888    
9888       888E  888E   4888>        888E  888I  %8"    R88   8888    
9888       888E  888E  .d888L .+     888E  888I   @8Wou 9%   .8888Lu= 
?8888u../  888E  888E  ^"8888*"     x888N><888' .888888P`    ^%888*   
 "8888P'  m888N= 888>     "Y"        "88"  888  `   ^"F        'Y"    
   "P'     `Y"   888                       88F                        
                J88"                      98"                         
                @%                      ./"                           
              :"                       ~`    
~~~

a `TIC-80 javascript with ECS` game about implementing a holy network

Test
## levels

### level 0 - tutorial

(dan harmon story circle "you")

(Chryst origin story, how he discovers that he can write prayers as programs and the stuff in the programs actually comes true. Step by step he discovers it and this will be the tutorial steps.)

Once, men coexisted with each other.
They shared peace forged in wisdom,
a peace, that lasted many generations.

### level 1 - one node

#### plot

see: [[Chapter - Bysfrost]]

#### gameplay

tower defense as programming
the user has to defend a node from monsters.

the code will look like this:
if enemy is in detection radius
emit enemy distraction signal (this takes power from capacity)

### level 2 - two nodes

a second node is added, and the user now has the ability to send messages and power from one node to another and.

the message system uses a message stack that can be read when the code runs in the specific tick.

the code system has to be hard capped by ms per invocation. (this is mana maybe)
if an invocation takes more than 16ms, the node will be disabled and has to be re-enabled. (this has to happen with a worker, later, now it can be done by the player with a cooldown period, click enable and then wait 10 seconds for it to boot)

the algorithm can be:
if their_capacity_percentage is higher than my_capacity_percentage than dont send power, else send power.

if monster in radius: deter monster based on distance, if it is closer, than send more power to it.

### level 3 - multiple nodes in a line

the user has to implement routing in a line with message passing

### level 4 - multiple nodes in a grid

the user has to implement routing in a grid with message passing based on an algorithm like packet flooding


## game design

it has three gameplay systems

### dialog system

this game has a plot and characters, and you can talk to them to advance the plot. this is also how the player gets exposition.

the player can choose what to say, and the characters will react accordingly. this will affect the plot.

there exists a reputation system, where each kingdom / faction has a reputation with the player. this will affect the plot. if the player chooses correct dialogue options, the reputation will increase. if the player chooses incorrect dialogue options, the reputation will decrease. 
consequences of high reputation: 
- the territory gets unlocked for the player on the map (maybe with some caveats for certain territories)
- in undertale, the player can be pacifist or genocidal, here it is somewhat the same. the player can choose to be a ruthless capitalist, and provide power grid services to everyone or exclude ruthless dictator states from the power grid. TODO what are the consequences of this? 

TODO: implement dialog system

### mechanic: power system

each node generates power each tick, based on the node size.
each node has a base demand of power each tick.
normally, the generation is higher than the demand, so the node has a surplus of power.
each node has a capacity, and can store power. 
each node can spend a little or a lot of power to deter monsters
each node can send power to other nodes, based on the connection radius.
each node can receive power from other nodes, based on the connection radius.
in later levels, the player can run different functions on the nodes like making the node invisible to monsters.

### code runner system

TODO: implement code editor 

the user has to solve technical problems with clever software engineering.


### worker management system

#### automated repairs

if a node gets destroyed by monsters or blows up because of the 16ms timeout, the player can send workers to repair it. 

at first this has to be done manually by the player, but later it can be automated with workers.

this is code on a worker central, a different type of node, that can automate workers
if a node is damaged, it will send a message to the worker central, and the worker central will send workers to repair it.
algorithm:
if node is damaged:
  send message to worker central

worker central:
  if message in stack:
    send workers to repair it


TODO: implement business logic code editor 
TODO: implement worker management status system like rollercoaster tycoon