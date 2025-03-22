"use client"

export default async function handleClick( event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault(); // Prevent the default link behavior
    try {
        console.log('clicked');
        const response = await fetch('http://localhost:4000/test', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: 'test' }),
        });
        console.log(await response.json());
    } catch (error) {
        console.error('Error:', error);
    }
}