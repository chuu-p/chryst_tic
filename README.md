~~~
                                                   .x+=:.        s    
            .uef^"                   ..           z`    ^%      :8    
          :d88E          .u    .    @L               .   <k    .88    
      .   `888E        .d88B :@8c  9888i   .dL     .@8Ned8"   :888ooo 
 .udR88N   888E .z8k  ="8888f8888r `Y888k:*888.  .@^%8888"  -*8888888 
<888'888k  888E~?888L   4888>'88"    888E  888I x88:  `)8b.   8888    
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

### code runner system

TODO: implement code editor 

### worker management system

TODO: implement business logic code editor 
TODO: implement worker management status system like rollercoaster tycoon