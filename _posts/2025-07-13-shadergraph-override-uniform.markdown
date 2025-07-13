---
layout: post
title: shadergraph-override-uniform
comments_id: 9
published: true
categories: ['unity']
tags: ['unity', 'shadergraph', 'hacks']
---

# Intro 

Sometimes you want to change how URP shader will perform calculations and of course you can change the source
code of URP package and then pass your custom data. Hovewer if you don't want to go this way and stay inside
shadergraph (URP package contains a lot of hlsl text based shaders) there is a somewhat "hacky" way. 
Of course Unity will never tell you how to do this!

In this article I will show you how to override ambient color per object and lighting functions (which is not directrly accesable)
will use our custom value.


# Preparation

Sure you know how to do this.
- Create basic scene. 
- Add a couple of objects, I use a couple of spheres. 
- Set some ambient color Window -> Rendering -> Lighting -> Environment -> Environment Lighting -> Source = solid, Color = (I choose red)
- Create lit shadergraph Right click -> Create -> Shader Graph -> URP -> Lit Shader -> Name it! 

Result :

![alt text](../images/2025-07-13-shadergraph-override-uniform-image.png)

# Shader Graph

Open shadergraph by double clicking.

![alt text](../images/2025-07-13-shadergraph-override-uniform-image-1.png)

Add new property of type Color, drag it in empty place. 
The main actor here will be a custom function node. Hit space and start typing "custom function". 
Replicate node settings as shows.

![alt text](../images/2025-07-13-shadergraph-override-uniform-image-2.png)

Ambient color stored in something called "Spherical Harmonics" coefficients. We only interested in last value of each color.
The idea here is to passthrough any value so Out = In. Our trick will work only if custom node connected to any inputs of master.

![alt text](../images/2025-07-13-shadergraph-override-uniform-image-3.png)

# Apply

Create new material : Right click shadergraph asset -> Creat -> Material. It will assign our newly created shader with default parameters.

Assing material to one of the meshes and try to change our color parameter.

![alt text](../images/turtle_ambient_color0.gif)


# Outro

Congrats not you have one more powerfull tool to survive in URP nightmare!!!
BTW this way you can read URP sources and learn any uniform value it uses and then change it's behaviour.