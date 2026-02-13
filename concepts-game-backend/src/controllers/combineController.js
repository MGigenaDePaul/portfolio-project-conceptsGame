import pool from '../database/db.js';

export const combineConcepts = async (req, res) => {
    try {
        const { boardId } = req.params;
        const { concept_a_id, concept_b_id, instance_a_id, instance_b_id } = req.body;

        // 🔍 DEBUG: See what's actually being received
        console.log('=== COMBINE REQUEST ===');
        console.log('Board ID:', boardId);
        console.log('Request body:', req.body);
        console.log('instance_a_id:', instance_a_id);
        console.log('instance_b_id:', instance_b_id);
        console.log('========================');
        
        // Validation
        if (!concept_a_id || !concept_b_id || !instance_a_id || !instance_b_id) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Check if instances exist FIRST
        const instancesPos = await pool.query(`
            SELECT id, concept_id, position_x, position_y
            FROM board_instances 
            WHERE id IN ($1, $2) AND board_id = $3
            `, [instance_a_id, instance_b_id, boardId])

            console.log('instancesPos', instancesPos)
        if (instancesPos.rows.length < 2) {
            return res.status(400).json({
                error: 'instances not found',
                message: 'One or both instance IDs do not exist on this board',
                provided: { instance_a_id, instance_b_id },
                found: instancesPos.rows.map(r => r.id)
            });
        }

        const instanceA = instancesPos.rows.find(r => r.id === instance_a_id);
        const instanceB = instancesPos.rows.find(r => r.id === instance_b_id);

        // Verify concepts match instances 
        if (instanceA.concept_id !== concept_a_id || instanceB.concept_id !== concept_b_id) {
            return res.status(400).json({
                error: 'Concept mismatch', 
                message: 'The concept IDs do not match the instances',
                expected: {
                    instance_a: instanceA.concept_id,
                    instance_b: instanceB.concept_id
                },
                received: { concept_a_id, concept_b_id}
            })
        }

        // Check if recipe exists
        const recipeResult = await pool.query(`
            SELECT * FROM recipes
            WHERE (ingredient1_id = $1 AND ingredient2_id = $2)
               OR (ingredient1_id = $2 AND ingredient2_id = $1)
            LIMIT 1
            `, [concept_a_id, concept_b_id]);

        if (recipeResult.rows.length === 0) {
            return res.status(404).json({ 
                error: 'No recipe found',
                message: 'These concepts cannot be combined' 
            });
        }

        const recipe = recipeResult.rows[0];
        const resultConceptId = recipe.result_id; 

        // Get the result concept details
        const conceptResult = await pool.query(`
            SELECT * FROM concepts WHERE id = $1
        `, [resultConceptId]);

        const resultConcept = conceptResult.rows[0];

        // Calculate complexity for this board
        const complexityA = await getConceptComplexity(boardId, concept_a_id);
        const complexityB = await getConceptComplexity(boardId, concept_b_id);
        const newComplexity = Math.max(complexityA, complexityB) + 1;

        // Check if already discovered on this board
        const discoveryCheck = await pool.query(`
            SELECT * FROM board_discoveries 
            WHERE board_id = $1 AND concept_id = $2
        `, [boardId, resultConceptId]);

        let isNewDiscovery = false;
        let complexityImproved = false;

        if (discoveryCheck.rows.length === 0) {
            // New discovery!
            isNewDiscovery = true;
            await pool.query(`
                INSERT INTO board_discoveries (board_id, concept_id, complexity)
                VALUES ($1, $2, $3)
            `, [boardId, resultConceptId, newComplexity]);
        } else {
            // Already discovered - check if complexity improved
            const existingComplexity = discoveryCheck.rows[0].complexity;
            if (newComplexity < existingComplexity) {
                complexityImproved = true;
                await pool.query(`
                    UPDATE board_discoveries 
                    SET complexity = $1
                    WHERE board_id = $2 AND concept_id = $3
                `, [newComplexity, boardId, resultConceptId]);
                
                // TODO: Trigger cascade effect here
            }
        }

        // Create new instance on the board
        const newInstanceId = `instance-${boardId}-${resultConceptId}-${Date.now()}`;
        
        // use the instances we already fetched
        const avgX = (instanceA.position_x + instanceB.position_x) / 2;
        const avgY = (instanceA.position_y + instanceB.position_y) / 2;

        await pool.query(`
            INSERT INTO board_instances (id, board_id, concept_id, position_x, position_y)
            VALUES ($1, $2, $3, $4, $5)
        `, [newInstanceId, boardId, resultConceptId, avgX, avgY]);

        // Delete the used instances
        await pool.query(`
            DELETE FROM board_instances WHERE id IN ($1, $2)
        `, [instance_a_id, instance_b_id]);

        // Return result
        res.json({
            success: true,
            concept: resultConcept,
            complexity: newComplexity,
            isNewDiscovery,
            complexityImproved,
            newInstance: {
                id: newInstanceId,
                position_x: avgX,
                position_y: avgY
            }
        });

    } catch (error) {
        console.error('Error combining concepts:', error);
        res.status(500).json({ error: error.message });
    }
};

// Helper function to get concept complexity on a board
async function getConceptComplexity(boardId, conceptId) {
    const result = await pool.query(`
        SELECT complexity FROM board_discoveries
        WHERE board_id = $1 AND concept_id = $2
    `, [boardId, conceptId]);

    return result.rows[0]?.complexity || 1;
}