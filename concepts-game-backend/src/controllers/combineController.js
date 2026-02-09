import pool from '../database/db.js'

export const combineConcepts = async (req, res) => {
    try {
        const { boardId } = req.params;
        const { concept_a_id, concept_b_id, instance_a_id, instance_b_id } = req.body;

        // Validation
        if (!concept_a_id || !concept_b_id || !instance_a_id || !instance_b_id) {
            return res.status(400).json({ error: 'Missing required fields for combination '})
        }

        // Check if recipe exists (try both orderings: A+B and B+A)
        const recipeResult = await pool.query(`
            SELECT * FROM recipes
            WHERE (concept_a_id = \$1 AND concept_b_id = \$2)
               OR (concept_a_id = \$2 AND concept_b_id = \$1)
            LIMIT 1
            `, [concept_a_id, concept_b_id]);

        if (recipeResult.rows.length === 0){
            return res.status(404).json({
                error: 'No recipe found',
                message: 'These concepts cannot be combined'
            });
        }

        const recipe = recipeResult.rows[0];
        const resultConceptId = recipe.result_concept_id;

        // Get the result concept details
        const conceptResult = await pool.query(`
            SELECT * FROM concepts WHERE id = \$1
            `, [resultConceptId])
        
        const resultConcept = conceptResult.rows[0];

        // Calculate complexity for this board
        const complexityA = await getConceptComplexity(boardId, concept_a_id)
        const complexityB = await getConceptComplexity(boardId, concept_b_id)
        const newComplexity = Math.max(complexityA, complexityB) + 1;

        // Check if already discovered on this board
        const discoveryCheck = await pool.query(`
            SELECT * FROM board_discoveries
            WHERE board_id = \$1 AND concept_id = \$2
            `, [boardId, resultConcept]);

        let isNewDiscovery = false;
        let complexityImproved = false;

        if (discoveryCheck.rows.length === 0) {
            // New Discovery!
            isNewDiscovery = true;
            await pool.query(`
                INSERT INTO board_discoveries (board_id, concept_id, complexity)
                VALUES (\$1, \$2, \$3)
                `, [boardId, resultConceptId, newComplexity])
        } else {
            // Already discovered - check if complexity improved
            const existingComplexity = discoveryCheck.rows[0].complexity;
            if (newComplexity < existingComplexity) {
                complexityImproved = true;
                await pool.query(`
                    UPDATE board_discoveries
                    SET complexity = \$1
                    WHERE board_id = \$2 AND concept_id = \$3
                    `, [newComplexity, boardId, resultConceptId])
                
                // TODO: Trigger cascade effect here
            }
        }

        // Create new instance on the board
        const newInstanceId = `instance-${boardId}-${resultConceptId}-${Date.now()}`;

        // Get position (average of the two combined instances)
        const instancesPos = await pool.query(`
        SELECT position_x, position_y FROM board_instances
        WHERE id IN (\$1, \$2)
        `, [instance_a_id, instance_b_id])

        const avgX = (instancesPos.rows[0].position_x + instancesPos.rows[1].position_x) / 2;
        const avgY = (instancesPos.rows[0].position_y + instancesPos.rows[1].position_y) /2;

        await pool.query(`
        INSERT INTO board_instances (id, board_id, concept_id, position_x, position_y)
        VALUES (\$1, \$2, \$3, \$4, \$5)
        `, [newInstanceId, boardId, resultConceptId, avgX, avgY]);

        // Delete the used instances
        await pool.query(`
        DELETE FROM board_instances WHERE id IN (\$1, \$2)
        `, [instance_a_id, instance_b_id])

        // Return result
        res.json({
            success: true,
            concept: resultConceptId,
            complexity: newComplexity,
            isNewDiscovery,
            complexityImproved,
            newInstanceId
        })
    } catch(error) {
      console.error('Error combining concepts', error)
      res.status(500).json({ error: error.message });
    }
};

// Helper function to get concept complexity on a board
async function getConceptComplexity(boardId, conceptId) {
    const result = await pool.query(`
        SELECT complexity FROM board_discoveries
        WHERE board_id = \$1 AND concept_id = \$2
        `, [boardId, conceptId])

        return result.rows[0]?.complexity || 1;
}