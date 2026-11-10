
#include <stdio.h>
#include <math.h>

int convertCoordinates(
    int from,
    int to,
    double a,
    double b,
    double c,
    double *out
);

#define TOLERANCE 0.0001

int passed = 0;
int failed = 0;

int approximatelyEqual(double a, double b) {
    return fabs(a - b) < TOLERANCE;
}

void runTest(
    const char *name,
    int from,
    int to,
    double a,
    double b,
    double c,
    double expected0,
    double expected1,
    double expected2,
    int expectedStatus
) {
    double result[3] = {0, 0, 0};

    int status = convertCoordinates(
        from, to, a, b, c, result
    );

    int success =
        status == expectedStatus &&
        approximatelyEqual(result[0], expected0) &&
        approximatelyEqual(result[1], expected1) &&
        approximatelyEqual(result[2], expected2);

    if (success) {
        printf("[PASS] %s\n", name);
        passed++;
    } else {
        printf("[FAIL] %s\n", name);

        printf("Expected: %.5f %.5f %.5f (status %d)\n",
            expected0, expected1, expected2, expectedStatus);

        printf("Received: %.5f %.5f %.5f (status %d)\n",
            result[0], result[1], result[2], status);

        failed++;
    }
}

void runInvalidTest(
    const char *name,
    int from,
    int to,
    double a,
    double b,
    double c
) {
    double result[3] = {0, 0, 0};

    int status = convertCoordinates(
        from, to, a, b, c, result
    );

    if (status == -1) {
        printf("[PASS] %s\n", name);
        passed++;
    } else {
        printf("[FAIL] %s\n", name);
        failed++;
    }
}

int main(void) {

    printf("\n");
    printf("========================================\n");
    printf(" MULTIVERSE OF COORDINATES\n");
    printf(" C ENGINE TESTING\n");
    printf("========================================\n\n");

    // Cartesian point (3, 4, 12)
    // Polar projection: (5, 53.1301)
    // Cylindrical: (5, 53.1301, 12)
    // Spherical: (13, 53.1301, 22.6199)

    // 1. Cartesian conversions

    runTest(
        "Cartesian to Polar",
        0, 1,
        3, 4, 12,
        5, 53.130102, 0,
        1
    );

    runTest(
        "Cartesian to Cylindrical",
        0, 2,
        3, 4, 12,
        5, 53.130102, 12,
        0
    );

    runTest(
        "Cartesian to Spherical",
        0, 3,
        3, 4, 12,
        13, 53.130102, 22.619865,
        0
    );

    // 2. Polar conversions

    runTest(
        "Polar to Cartesian",
        1, 0,
        5, 53.130102, 0,
        3, 4, 0,
        0
    );

    runTest(
        "Polar to Cylindrical",
        1, 2,
        5, 53.130102, 0,
        5, 53.130102, 0,
        0
    );

    runTest(
        "Polar to Spherical",
        1, 3,
        5, 53.130102, 0,
        5, 53.130102, 90,
        0
    );

    // 3. Cylindrical conversions

    runTest(
        "Cylindrical to Cartesian",
        2, 0,
        5, 53.130102, 12,
        3, 4, 12,
        0
    );

    runTest(
        "Cylindrical to Polar",
        2, 1,
        5, 53.130102, 12,
        5, 53.130102, 0,
        1
    );

    runTest(
        "Cylindrical to Spherical",
        2, 3,
        5, 53.130102, 12,
        13, 53.130102, 22.619865,
        0
    );

    // 4. Spherical conversions

    runTest(
        "Spherical to Cartesian",
        3, 0,
        13, 53.130102, 22.619865,
        3, 4, 12,
        0
    );

    runTest(
        "Spherical to Polar",
        3, 1,
        13, 53.130102, 22.619865,
        5, 53.130102, 0,
        1
    );

    runTest(
        "Spherical to Cylindrical",
        3, 2,
        13, 53.130102, 22.619865,
        5, 53.130102, 12,
        0
    );

    // 5. Invalid input tests

    runInvalidTest(
        "Reject negative polar radius",
        1, 0, -5, 30, 0
    );

    runInvalidTest(
        "Reject invalid spherical angle",
        3, 0, 5, 30, 200
    );

    runInvalidTest(
        "Reject invalid coordinate system",
        9, 0, 1, 2, 3
    );

    // 6. Summary

    printf("\n");
    printf("========================================\n");
    printf(" TEST SUMMARY\n");
    printf("========================================\n");

    printf("Passed: %d\n", passed);
    printf("Failed: %d\n", failed);
    printf("Total : %d\n", passed + failed);

    if (failed == 0) {
        printf("\nALL TESTS PASSED!\n");
    } else {
        printf("\nSOME TESTS FAILED!\n");
    }

    printf("========================================\n");

    return failed == 0 ? 0 : 1;
}

