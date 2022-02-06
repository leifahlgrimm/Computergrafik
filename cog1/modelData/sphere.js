/**
 * Creates a unit sphere by subdividing a unit octahedron.
 * Starts with a unit octahedron and subdivides the faces,
 * projecting the resulting points onto the surface of a unit sphere.
 *
 * For the algorithm see:
 * https://sites.google.com/site/dlampetest/python/triangulating-a-sphere-recursively
 * http://sol.gfxile.net/sphere/index.html
 * http://nipy.sourceforge.net/dipy/reference/dipy.core.triangle_subdivide.html
 * http://skyview.gsfc.nasa.gov/blog/index.php/2008/12/31/skyview-to-include-healpix-and-wmap/
 *
 *        1
 *       /\
 *      /  \
 *    b/____\ c
 *    /\    /\
 *   /  \  /  \
 *  /____\/____\
 * 0      a     2
 *
 * Parameter:
 * 	recursionDepth
 * 	color or -1 = many colors
 *
 * For texture see:
 * http://earthobservatory.nasa.gov/Features/BlueMarble/
 *
 * @namespace cog1.data
 * @module sphere
 */

define(["exports", "data", "glMatrix"], function(exports, data) {
	"use strict";

	const init_vertices = [
		[1.0, 0.0, 0.0], 	// 0
		[-1.0, 0.0, 0.0], 	// 1
		[0.0, 1.0, 0.0], 	// 2
		[0.0, -1.0, 0.0], 	// 3
		[0.0, 0.0, 1.0], 	// 4
		[0.0, 0.0, -1.0] 	// 5
	];

	const init_polygon = [
		[0, 4, 2],
		[2, 4, 1],
		[1, 4, 3],
		[3, 4, 0],
		[0, 2, 5],
		[2, 1, 5],
		[1, 3, 5],
		[3, 0, 5]
	];


	/**
	 * Procedural calculation.
	 *
	 * @parameter object with fields:
	 * @parameter scale
	 * @parameter recursionDepth
	 * @parameter color [-1 for many colors]
	 */
	exports.create = function(parameter) {
				
		if(parameter) {
			var scale = parameter.scale;
			var recursionDepth = parameter.recursionDepth;
			var color = parameter.color;
			var textureURL = parameter.textureURL;
		}
		// Set default values if parameter is undefined.
		if(scale == undefined) {
			scale = 250;
		}
		if(recursionDepth == undefined) {
			recursionDepth = 3;
		}
		if(color == undefined) {
			color = 9;
		}
		if(textureURL == undefined) {
			textureURL = "";
		}

		// Instance of the model to be returned.
		var instance = {};

		// BEGIN exercise Sphere

		instance.vertices = [
			[0,1,0],
			[1,0,0],
			[0,0,-1],
			[-1,0,0],
			[0,0,1],
			[0,-1,0]
		]

		instance.polygonVertices = [
			[0,4,1],
			[0,1,2],
			[0,2,3],
			[0,3,4],

			[1,4,5],
			[2,1,5],
			[3,2,5],
			[4,3,5],
		]

		devide_all.call(instance, recursionDepth);

		// END exercise Sphere

		generateTextureCoordinates.call(instance);

		data.applyScale.call(instance, scale);
		data.setColorForAllPolygons.call(instance, color);

		instance.textureURL = textureURL;

		return instance;
	}
	/**
	 * Called with this pointer set to instance.
	 * Generate texture coordinates one per each corner of a polygon,
	 * thus a vertex can have more than one uv, depending on the polygon it is part of.
	 * The coordinates u.v represent the angles theta and phi
	 * of point vector to x and y axis.
	 * See:
	 * http://tpreclik.dyndns.org/codeblog/?p=9
	 *
	 * Assume that vertices are not yet scaled, thus have length 1.
	 *
	 */
	function generateTextureCoordinates() {

		// BEGIN exercise Sphere-Earth-Texture

		// As there is not exactly one texture coordinate per vertex,
		// we have to install a different mapping as used for polygonVertices to vertices.
		// For texture coordinate system use openGL standard, where origin is bottom-left.
		this.textureCoord = [];
		this.polygonTextureCoord = [];


			// Loop over vertices/edges in polygon.

				// Shorthands for the current vertex.


				// Calculate longitude (east-west position) phi (u-coordinate).
				// arctangent (of here z/x), representing the angle theta between the positive X axis, and the point.
				// Scale phi to uv range [0,1].


				// Calculate latitude (north-south position) theta (v-coordinate) from y component of vertex.
				// Scale theta to uv range [0,1].


				// Store new uv coordinate in new uv-vector.
				//console.log("phi:" + (~~(phi * 100)) + "  theta:" + (~~(theta * 100)) + " x:" + (~~(x * 100)) + " z:" + (~~(z * 100)));
				

		// Problem with phi/u: phi=360 and phi=0 are the same point in 3D and also on a tiled texture.
		// But for faces it is a difference if uv-range is 350�-360� [.9-1]or 350�-0� [.9-0].
		// Thus, insert a check/hack (assuming faces cover only a small part of the texture):

			// Check if u-range should be low or high (left or right in texture),
			// by summing up u values (ignoring u=0 values).

			// Check and correct u values if 0;
		
		// END exercise Sphere-Earth-Texture
	}

	// BEGIN exercise Sphere
	function center(a, b) {
		var x = (a[0] + b[0]) / 2;
		var y = (a[1] + b[1]) / 2;
		var z = (a[2] + b[2]) / 2;
		return [x,y,z]
	}

	function projectPoint(p) {
		var f = Math.sqrt(1 / (p[0] * p[0] + p[1] * p[1] + p[2] * p[2]));
		var x = (p[0] * f);
		var y = (p[1] * f);
		var z = (p[2] * f);
		return [ x, y, z]
	}

	/**
	 * Recursively divide all triangles.
	 */
	function devide_all(recursionDepth, nbRecusions) {
		var instance = this;

		// nbRecusions is not set from initial call.
		if(nbRecusions == undefined) {
			nbRecusions = 0;
		}
		// Stop criterion.
		if(nbRecusions == recursionDepth) {
			return;
		}
		console.log("nbRecusions: "+nbRecusions);

		// Assemble divided polygons in an new array.#
		var newPoly = []
		var polycount = instance.polygonVertices.length

		// Indices of the last three new vertices.
		for(var p=0; p < polycount; p++) {
			// Calculate new vertex in the middle of edge.
			var p1 = (center(instance.vertices[instance.polygonVertices[p][0]],
				instance.vertices[instance.polygonVertices[p][1]]));
			var p2 = (center(instance.vertices[instance.polygonVertices[p][1]],
				instance.vertices[instance.polygonVertices[p][2]]));
			var p3 = (center(instance.vertices[instance.polygonVertices[p][2]],
				instance.vertices[instance.polygonVertices[p][0]]));

			var newPoints = []
			newPoints.push(projectPoint(p1));
			newPoints.push(projectPoint(p2));
			newPoints.push(projectPoint(p3));

			// Check if the new vertex exists already.
			// This happens because edges always belong to two triangles.
			var ref = []
			for (var j = 0; j < 3; j++) {
				let existingVertexId = -1
				for (let k = 0; k < instance.vertices.length; k++) {
					let current = instance.vertices[k]
					if (current[0] === newPoints[j][0] && current[1] === newPoints[j][1] && current[2] === newPoints[j][2]) {
						existingVertexId = k;
						break;
					}
				}

				if (existingVertexId != -1) {
					// Use the existing vertex for the new polygon.
					ref[j] = existingVertexId
				} else {
					// Remember index of new vertex.
					instance.vertices.push(newPoints[j])
					ref[j] = instance.vertices.length - 1

				}
			}

			// Assemble new polygons.
			// Assure mathematical positive order to keep normals pointing outwards.
			// Triangle in the center.
			newPoly.push([ref[0], ref[1], ref[2]])
			// Triangle in the corners.
			newPoly.push([ref[0], ref[2], instance.polygonVertices[p][0]])
			newPoly.push([ref[1], ref[0], instance.polygonVertices[p][1]])
			newPoly.push([ref[2], ref[1], instance.polygonVertices[p][2]])

			//console.log("Assemble new polygons "+v+" : "+p[v]+" , "+ newIndex[nextButOne]+" , "+ newIndex[v]);
		}
		// Swap result.
		instance.polygonVertices = newPoly;
		// Recursion.
		nbRecusions = nbRecusions +1;

		devide_all.call(instance, recursionDepth, nbRecusions);

	}
	
	// END exercise Sphere

});
