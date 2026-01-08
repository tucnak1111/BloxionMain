export default async function Homepage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return (
        <div><p>Workspace ID: {id}</p></div>
    );
}