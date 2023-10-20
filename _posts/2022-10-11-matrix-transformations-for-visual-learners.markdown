---
layout: post
title: Matrix transformations for visual learners
comments_id: 7
published: true
categories: ["tutorial"]
tags: ["projection", "glsl", "threejs"]
sidebar: []
---

In this tutorial I will try to explain how all theese transformation matrices with some help of visuals.

<h3 id="initial" class="state_transition">What is a Matrix?</h3>

Matrix is not film, sorry.
Matrix is like a table of numbers with one or more dimentions. They have some rules that we have to obey in order to use them in our advantage.

In computer graphics you will see that 4x4 matrix in use, they can express <span style="color:green">translate</span>, <span style="color:purple">scale</span> and <span style="color:red">rotation</span> at the same time and using only multiplication to apply on vectors and combine together.

<span id="example_matrix_mathjax"></span>

Vectors are written with 4 elements : $\begin{bmatrix} x \\ y \\ z \\ 1 \end{bmatrix}$

We use 4x4 matrix because this is a nifty trick to use multiplication for all transformations. Last column of the matrix above does not have a physical maeaning as <span style="color:green">translate</span>, <span style="color:purple">scale</span> and <span style="color:red">rotation</span>, but it makes math so simple!

There is two distinct options to write down a matrix and a vector - row and column major. This little thing is really important because if you mess with it you will get unpredictable result in your shaders.

Math notation commonly use row-major vector looks like this : $\begin{bmatrix} x & y & z & 1 \end{bmatrix}$

OpenGL uses column-major and I will use it also: $\begin{bmatrix} x \\ y \\ z \\ 1 \end{bmatrix}$

You may ask yourself, does this matter? Aren't they the same thing? I will tell you that they are completely different. Matrices is all about structure and order, and you should care about this things if you want to use their power.

In order to transform a point by 4x4 matrix in column major form you need to apply matrix to the left :

### How to use matrix

In order to use/apply a matrix you need to multiply it from the correct side of matrix or vector. Let's say

### Why do we need Matrix?

First time I saw a matrix I thought to myself that it is a very useless thing in math.
Years came by and now I feel that I want to use matrix transformations everywhere! This is very handy mathematical tool that can abstract cumbersome computation away from your mind.

### Rules:

The only rule we need to know is that matrix mulitplication is not commutative :

- $ A \cdot B \neq B \cdot A $

<details> 
  <summary>There is some other rules which you can learn here. </summary>
<h3> Commutative laws </h3>

Addition order does not matter, but multiplication does. Very important one!

<ul>
    <li> $ A+B = B+A $ </li>
    <li> $ A \cdot B \neq B \cdot A $ </li>
</ul>

<h3> Associative </h3>

Group operations in any order you find useful

<ul>
    <li> $ A \cdot B \cdot C = A \cdot (B \cdot C) = (A \cdot B) \cdot C $ </li>
    <li> $ A + B + C = A + (B + C) = (A + B) + C $ </li>
</ul>
<h3> Distributive </h3>
Undo brackets as usual.
<ul>
    <li> $ A \cdot (B+C) = A \cdot B + A \cdot C $ </li>
</ul>

</details>

<h3 id="initial_state" class="state_transition">Model Matrix</h3>
Here you can see the inital state of the scene with a textured cube and the camera. They both have the same transformartion matrix :

<span id="identity_matrix_mathjax"></span>

Which is Identity matrix. If you multiply this matrix with any other you will get the same matrix as before.

{% include button.html button_id="initial_btn" button_name="Show Initial State" button_class="primary" %}

<h3 id="model_matrix" class="state_transition">Model Matrix</h3>

Every object in the scene will have a Model Matrix which represents all the transformations required to put object in world space for rendering.

<span id="model_matrix_mathjax"></span>

{% include button.html button_id="model_btn" button_name="Move to World Space" button_class="primary" %}

<h3 id="view_matrix" class="state_transition">View Matrix</h3>

{% include button.html button_id="view_btn" button_name="Move to Camera Space" button_class="primary" %}

<h3 id="projection_matrix" class="state_transition">Projection Matrix</h3>

{% include button.html button_id="proj_btn" button_name="Move to Projection Space" button_class="primary" %}

{% include threejs_boilerplate.html %}

<script id="fragmentShader-cube" type="x-shader/x-fragment">

uniform float time;
uniform float delta;

varying vec2 vUV;
varying vec4 vPos;

uniform sampler2D map;

void main()	{
    vec3 pos = vPos.xyz / vPos.w;
    
    float edge = cos(time) * 0.5 + 1.5;
    edge = 1.0;
    vec3 outside = abs(pos); // step(vec3(edge), );
    float outStep = max(max(outside.x, outside.y), outside.z);
    vec4 diff = texture2D(map, vUV);
    vec3 col  = mix(diff.xyz, diff.xyz * vec3(1.0, 0.0, 0.0), step(edge, outStep));
    //if (!gl_FrontFacing) col = vec3(1.0, 0.0, 1.0);

    gl_FragColor = vec4(col, 1.0);
    //if (outStep > 0.0) discard;
    gl_FragColor = diff;
}
</script>

<script id="vertexShader-cube"  type="x-shader/x-vertex">

varying vec2 vUV;
varying vec4 vPos;

  void main() {
    vUV = uv;

    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    //modelPosition.xyz /= modelPosition.w;

    //modelPosition.w = 1.0;
    vPos = modelPosition;
    gl_Position = projectionMatrix * viewMatrix * modelPosition; 
  }
</script>

<script src="/assets/scripts/tutorials/matrix_transform_visual.js" type="module">
