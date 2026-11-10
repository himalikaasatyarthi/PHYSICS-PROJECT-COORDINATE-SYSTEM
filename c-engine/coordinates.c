
#include <stdio.h>
#include <math.h>

#ifdef __EMSCRIPTEN__
#include <emscripten/emscripten.h>
#define EXPORT EMSCRIPTEN_KEEPALIVE
#else
#define EXPORT
#endif

#define PI 3.14159265358979323846
#define EPSILON 1e-10

/*
    MULTIVERSE OF COORDINATES
    C Coordinate Conversion Engine

    Coordinate System IDs:
    0 = Cartesian
    1 = Polar
    2 = Cylindrical
    3 = Spherical

    Angle convention:
    theta = azimuth angle in XY plane
    phi   = polar angle from positive Z-axis

    Input angles are in degrees.
*/

// Convert degrees to radians
double toRadians(double degrees) {
    return degrees * PI / 180.0;
}

// Convert radians to degrees
double toDegrees(double radians) {
    return radians * 180.0 / PI;
}

// Normalize angle between 0 and 360 degrees
double normalizeAngle(double angle) {
    angle = fmod(angle, 360.0);

    if (angle < 0)
        angle += 360.0;

    if (fabs(angle - 360.0) < EPSILON ||
        fabs(angle) < EPSILON)
        return 0.0;

    return angle;
}

// Structure for Cartesian coordinates
typedef struct {
    double x;
    double y;
    double z;
} Cartesian;

// Structure for Polar coordinates
typedef struct {
    double r;
    double theta;
} Polar;

// Structure for Cylindrical coordinates
typedef struct {
    double rho;
    double theta;
    double z;
} Cylindrical;

// Structure for Spherical coordinates
typedef struct {
    double r;
    double theta;
    double phi;
} Spherical;


// =======================================
// CARTESIAN CONVERSIONS
// =======================================

Cartesian polarToCartesian(Polar p) {
    Cartesian c;

    c.x = p.r * cos(toRadians(p.theta));
    c.y = p.r * sin(toRadians(p.theta));
    c.z = 0.0;

    return c;
}

Cartesian cylindricalToCartesian(Cylindrical p) {
    Cartesian c;

    c.x = p.rho * cos(toRadians(p.theta));
    c.y = p.rho * sin(toRadians(p.theta));
    c.z = p.z;

    return c;
}

Cartesian sphericalToCartesian(Spherical p) {
    Cartesian c;

    double theta = toRadians(p.theta);
    double phi = toRadians(p.phi);

    c.x = p.r * sin(phi) * cos(theta);
    c.y = p.r * sin(phi) * sin(theta);
    c.z = p.r * cos(phi);

    return c;
}


// =======================================
// CONVERSIONS TO POLAR
// =======================================

Polar cartesianToPolar(Cartesian c) {
    Polar p;

    p.r = sqrt(c.x * c.x + c.y * c.y);
    p.theta = normalizeAngle(
        toDegrees(atan2(c.y, c.x))
    );

    return p;
}


// =======================================
// CONVERSIONS TO CYLINDRICAL
// =======================================

Cylindrical cartesianToCylindrical(Cartesian c) {
    Cylindrical p;

    p.rho = sqrt(c.x * c.x + c.y * c.y);
    p.theta = normalizeAngle(
        toDegrees(atan2(c.y, c.x))
    );
    p.z = c.z;

    return p;
}


// =======================================
// CONVERSIONS TO SPHERICAL
// =======================================

Spherical cartesianToSpherical(Cartesian c) {
    Spherical p;

    p.r = sqrt(
        c.x * c.x +
        c.y * c.y +
        c.z * c.z
    );

    p.theta = normalizeAngle(
        toDegrees(atan2(c.y, c.x))
    );

    if (p.r < EPSILON) {
        p.theta = 0.0;
        p.phi = 0.0;
    }
    else {
        double ratio = c.z / p.r;

        if (ratio > 1.0) ratio = 1.0;
        if (ratio < -1.0) ratio = -1.0;

        p.phi = toDegrees(acos(ratio));
    }

    return p;
}


// =======================================
// MAIN CONVERSION FUNCTION
// =======================================

/*
    Input:
    from = source coordinate system
    to   = destination coordinate system

    a, b, c = input coordinate values

    Output:
    out[0], out[1], out[2]

    Return values:
     0 = successful conversion
     1 = polar projection (height omitted)
    -1 = invalid input or coordinate system
*/

EXPORT int convertCoordinates(
    int from,
    int to,
    double a,
    double b,
    double c,
    double *out
) {

    if (out == NULL)
        return -1;

    if (from < 0 || from > 3 ||
        to < 0 || to > 3)
        return -1;

    // Validate input values
    if (!isfinite(a) || !isfinite(b) || !isfinite(c))
        return -1;

    if ((from == 1 || from == 2 || from == 3) && a < 0)
        return -1;

    if (from == 3 && (c < 0 || c > 180))
        return -1;

    Cartesian cart;

    // Convert source system into Cartesian
    switch (from) {

        case 0:
            cart.x = a;
            cart.y = b;
            cart.z = c;
            break;

        case 1: {
            Polar p = {a, b};
            cart = polarToCartesian(p);
            break;
        }

        case 2: {
            Cylindrical p = {a, b, c};
            cart = cylindricalToCartesian(p);
            break;
        }

        case 3: {
            Spherical p = {a, b, c};
            cart = sphericalToCartesian(p);
            break;
        }

        default:
            return -1;
    }

    out[0] = 0.0;
    out[1] = 0.0;
    out[2] = 0.0;

    // Convert Cartesian into destination system
    switch (to) {

        case 0:
            out[0] = cart.x;
            out[1] = cart.y;
            out[2] = cart.z;
            break;

        case 1: {
            Polar p = cartesianToPolar(cart);

            out[0] = p.r;
            out[1] = p.theta;

            // Polar coordinates omit height
            if (fabs(cart.z) > EPSILON)
                return 1;

            break;
        }

        case 2: {
            Cylindrical p = cartesianToCylindrical(cart);

            out[0] = p.rho;
            out[1] = p.theta;
            out[2] = p.z;
            break;
        }

        case 3: {
            Spherical p = cartesianToSpherical(cart);

            out[0] = p.r;
            out[1] = p.theta;
            out[2] = p.phi;
            break;
        }

        default:
            return -1;
    }

    return 0;
}

