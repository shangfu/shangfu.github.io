---
layout: post
title: "Reliable Fortune's algorithm implementation"
date: 2015-08-26 19:30:06 +0000
comments: true
categories: Algorithm
tags: [Voronoi, Fortune's algorithm, Boost, CGAL]
---


->![Wiki](https://upload.wikimedia.org/wikipedia/commons/0/0c/Fortunes-algorithm-slowed.gif)<-

    
Fortune's algorithm is a sweep line algorithm for generating 
a Voronoi diagram from a set of points in a plane using \\(O(n log n)\\) time and \\(O(n)\\) space 
[[Wiki](https://en.wikipedia.org/wiki/Fortune%27s_algorithm)]. 

I have one subtask that need to generate a Voronoi diagram for 24 million vertices in the USA road network.
As far as I tested, many Fortune's algorithm implementations online are not reliable. 
They may be OK to generate the Voronoi diagram from random points, but sometimes shitty 
to process the points that are concyclic. 
For example, few of them can solve the simple case even for 4 points, 
$$(0,0), (0,1), (1,0), (1,1)$$
On the other hand, some implementations that can pass my small test cases still face the speed problem 
for 24 million vertices. 

Finally, I recommand three implementations:


## Boost.Polygon Voronoi
A little ashamed that I did not know Boost has also implemented Voronoi. It is the last implementation I tried, 
but I should recommand it first since it is super easy to use.
Here is the Boost Voronoi 
[Main Page](http://www.boost.org/doc/libs/1_54_0/libs/polygon/doc/voronoi_main.htm) and 
[Benchmark](http://www.boost.org/doc/libs/1_54_0/libs/polygon/doc/voronoi_benchmark.htm) compared with CGAL and S-Hull 
(related to qhull)
As the Benchmark said,

- Boost.Polygon Voronoi - implements sweep-line algorithm.
- CGAL - implements incremental algorithm. 
- S-Hull - S-Hull is a **non-robust implementation** of the sweep-hull algorithm used to construct Delaunay triangulation of a set of points.

Using Boost Voronoi, my Voronoi computation for 24 million road vertices just speeds around 10 mins. Here is my simple code after 
install `libboost-dev` in Ubuntu Software Center. Note that in the output of this code, every Voronoi edge will be reported twice.  

{% codeblock lang:cpp voronoi.cpp %}
{% raw %}
#include "boost/polygon/voronoi.hpp"
#include <iostream>

using namespace boost::polygon;

typedef double coordinate_type;
typedef point_data<coordinate_type> Point;
typedef voronoi_diagram<double> VD;

int main(int argc, char* argv[])
{
    std::vector<Point> points;

//    points.push_back(Point(0, 0));
//    points.push_back(Point(1, 0));
//    points.push_back(Point(0, 1));
//    points.push_back(Point(1, 1));
	int n;
	std::cin>>n;
	double x,y;
	for (int i=0; i<n; i++) {
		std::cin>>x>>y;
		points.push_back(Point(x,y));
	}
	VD vd;
	construct_voronoi(points.begin(), points.end(), &vd);

	for (VD::const_edge_iterator it = vd.edges().begin(); it != vd.edges().end(); ++it)
    {
        if (it->is_primary())
        {
            if (it->is_finite())
            {
				std::cout<<"("<<it->vertex0()->x()<<","<<it->vertex0()->y()<<") --- ("<<it->vertex1()->x()<<","<<it->vertex1()->y()<<")"<<std::endl;
            }
            else
            {
                Point p1 = points[it->cell()->source_index()];
                Point p2 = points[it->twin()->cell()->source_index()];
                Point origin;
                Point direction;
                coordinate_type koef = 1.0;

                origin.x((p1.x() + p2.x()) * 0.5);
                origin.y((p1.y() + p2.y()) * 0.5);
                direction.x(p1.y() - p2.y());
                direction.y(p2.x() - p1.x());
                if (it->vertex0() == NULL){
                    std::cout<<"("<<	origin.x() - direction.x() * koef<<","<<origin.y() - direction.y() * koef<<") --- ";
                }
                else{
					std::cout<<"("<<it->vertex0()->x()<<","<<it->vertex0()->y()<<")  --- ";
                }

                if (it->vertex1() == NULL){
                    std::cout<<"("<<origin.x() + direction.x() * koef<<","<<origin.y() + direction.y() * koef<<")"<<std::endl;                
                }
                else{
                	std::cout<<"("<<it->vertex1()->x()<<","<<it->vertex1()->y()<<")"<<std::endl;
                }
            }
        }
    }
    return 0;
}
{% endraw %}
{% endcodeblock %}


## CGAL library
As mentioned by Boost Voronoi, CGAL implements incremental algorithm.
The obscurest thing of CGAL is the compiling process. 

It is better to use `cmake` to link your program to CGAL libraries as follows. 

1. Install `libcgal-dev` and `libcgal-demo` in Ubuntu Software Center. I think it should automatically install Boost C++ libraries as well. 
If not, you need to install `libboost-dev` in Ubuntu Software Center. 


2. In order to compile your program correctly, you'd better to generate `CMakeLists.txt` by running `cgal_create_cmake_script` command 
in Terminal. In particular, you should run the following commands in your program folder:

```
cgal_create_cmake_script   #generate CMakeLists.txt
cmake .                    #generate Makefile, CMakeFiles folder, and two extra files
make                       #automatically compile your .cpp files
```


## Brad Barber's Qhull program
[Qhull](http://www.qhull.org/) is also easy to use. Just download and decompressed the package, and then `make` it. 
The examples of Qhull are clear. `rbox` command can generate the example input format, and then use `qvoronoi` 
to compute Voronoi diagram.


