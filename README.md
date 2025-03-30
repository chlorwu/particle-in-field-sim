HOW TO OPERATE:
1. Input things into the field first, the graph doesn't show up unless you do.
2. Scroll to zoom in/out. Drag to rotate field.
3. You must click "start" for the particle to start moving. The particle accelerates pretty fast, so it'll move out of screen after a few steps unless you can catch up by zooming out.
4. The particle's mass + charge are hard-coded but really didn't have to be. They could've been user-inputtable too.

CHLOE'S NOTES:
1. *blood, sweat, tears*
2. We can use a transformation matrix to describe the effect of the Lorentz force on the particle. One multiplication of this matrix onto the the particle's state vector [x, y, z, vx, vy, vz] represents the instantaneous change in that particle in delta time.
3. I translated this transformation matrix into mathematical operations for each variable separately. I learned afterwards that three.js supports matrix operations...
