import bcrypt from 'bcryptjs';

const data = {
    users: [
        {
            name: 'name1',
            email: 'name1@gmail.com',
            password: bcrypt.hashSync('1234'),
            isAdmin: true

        },
        {
            name: 'name2',
            email: 'name2@gmail.com',
            password: bcrypt.hashSync('1234'),
            isAdmin: false

        }
    ],

    products: [
        {
            // _id: '1',
            name: 'Backpacking Tent1',
            slug: 'backpacking-tent1',
            category: 'tents',
            image: '/images/p1.jpg',
            price: 12000,
            rent: 800,
            countInStock: 20,
            brand: 'Colman',
            rating: 4.5,
            numReviews: 18,
            description: 'Lightweight Backpacking Tent'
        },
        {
            // _id: '2',
            name: 'Backpacking Tent2',
            slug: 'backpacking-tent2',
            category: 'tents',
            image: '/images/p1.jpg',
            price: 120,
            rent: 800,
            countInStock: 8,
            brand: 'Colman',
            rating: 5,
            numReviews: 1,
            description: 'Lightweight Backpacking Tent'
        },
        {
            // _id: '3',
            name: 'Backpacking Tent4',
            slug: 'backpacking-tent3',
            category: 'tents',
            image: '/images/p1.jpg',
            price: 12,
            rent: 800,
            countInStock: 0,
            brand: 'Colman',
            rating: 0.5,
            numReviews: 10,
            description: 'Lightweight Backpacking Tent'
        }
        ,
        {
            // _id: '4',
            name: 'Backpacking Tent44',
            slug: 'backpacking-tent4',
            category: 'tents',
            image: '/images/p1.jpg',
            price: 12,
            rent: 800,
            countInStock: 120,
            brand: 'Colman',
            rating: 2.5,
            numReviews: 10,
            description: 'Lightweight Backpacking Tent'
        }
    ]
};

export default data;