export default async function Homepage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return (
        <div className="p-6">
            <p>Workspace ID: {id}</p>
        </div>
    );
}